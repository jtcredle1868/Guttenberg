import { Request, Response, NextFunction } from 'express';

// ─── Types ────────────────────────────────────────────────────────────────────

interface RateLimitOptions {
  /** Maximum requests allowed within the window */
  limit: number;
  /** Window size in milliseconds */
  windowMs: number;
  /** Optional human-readable label for error messages */
  label?: string;
}

/** One sliding-window bucket per IP */
interface Bucket {
  /** Timestamps (epoch ms) of requests within the current window */
  timestamps: number[];
}

// ─── In-memory store ─────────────────────────────────────────────────────────

// Map keyed by "<windowMs>:<limit>:<ip>" so different limiters don't collide.
const store = new Map<string, Bucket>();

/** Purge buckets whose most-recent timestamp is older than 2× the given window. */
function pruneStore(windowMs: number): void {
  const cutoff = Date.now() - windowMs * 2;
  for (const [key, bucket] of store.entries()) {
    if (bucket.timestamps.length === 0 || bucket.timestamps[bucket.timestamps.length - 1] < cutoff) {
      store.delete(key);
    }
  }
}

// Prune every 5 minutes regardless of traffic.
setInterval(() => {
  const cutoff = Date.now() - 10 * 60 * 1000;
  for (const [key, bucket] of store.entries()) {
    if (!bucket.timestamps.some((t) => t > cutoff)) store.delete(key);
  }
}, 5 * 60 * 1000).unref();

// ─── Middleware factory ───────────────────────────────────────────────────────

/**
 * Returns an Express middleware implementing a per-IP sliding-window rate limiter.
 *
 * Rate-limit headers are always set:
 *   X-RateLimit-Limit     – configured max requests per window
 *   X-RateLimit-Remaining – requests left in the current window
 *   X-RateLimit-Reset     – Unix timestamp (seconds) when the oldest request ages out
 *
 * On breach, responds 429 with error code GUT-4290.
 */
export function rateLimit(options: RateLimitOptions) {
  const { limit, windowMs, label = 'this endpoint' } = options;
  const namespacePrefix = `${windowMs}:${limit}`;

  // Stagger pruning so all limiters don't fire simultaneously.
  const pruneInterval = setInterval(() => pruneStore(windowMs), windowMs);
  pruneInterval.unref();

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = (
      req.headers['x-forwarded-for'] as string | undefined
    )?.split(',')[0].trim() || req.socket.remoteAddress || 'unknown';

    const key    = `${namespacePrefix}:${ip}`;
    const now    = Date.now();
    const cutoff = now - windowMs;

    if (!store.has(key)) store.set(key, { timestamps: [] });

    const bucket = store.get(key)!;

    // Remove timestamps outside the sliding window
    bucket.timestamps = bucket.timestamps.filter((t) => t > cutoff);

    const count     = bucket.timestamps.length;
    const remaining = Math.max(0, limit - count - 1);
    // Reset = when the oldest in-window request will age out
    const oldestInWindow = bucket.timestamps[0] ?? now;
    const resetMs        = oldestInWindow + windowMs;

    res.setHeader('X-RateLimit-Limit',     String(limit));
    res.setHeader('X-RateLimit-Remaining', String(remaining));
    res.setHeader('X-RateLimit-Reset',     String(Math.ceil(resetMs / 1000)));

    if (count >= limit) {
      const retryAfterSec = Math.max(1, Math.ceil((resetMs - now) / 1000));
      res.setHeader('Retry-After', String(retryAfterSec));
      res.status(429).json({
        success: false,
        error: {
          code:       'GUT-4290',
          message:    'Too many requests',
          detail:     `Rate limit exceeded for ${label}. Limit: ${limit} requests per ${Math.round(windowMs / 1000)}s window.`,
          resolution: `Wait ${retryAfterSec} second(s) before retrying.`,
          docs_url:   'https://docs.guttenberg.io/errors/GUT-4290',
        },
      });
      return;
    }

    bucket.timestamps.push(now);
    next();
  };
}

// ─── Pre-configured limiters ─────────────────────────────────────────────────

/** Strict limit for authentication endpoints: 5 requests per 15 minutes. */
export const authRateLimit = rateLimit({
  limit:    5,
  windowMs: 15 * 60 * 1000,
  label:    'authentication',
});

/** General API limit: 100 requests per minute. */
export const generalRateLimit = rateLimit({
  limit:    100,
  windowMs: 60 * 1000,
  label:    'the API',
});
