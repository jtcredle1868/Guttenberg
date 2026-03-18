import { Request, Response, NextFunction } from 'express';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id:    string;
  email: string;
  name:  string;
  role:  string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
  requestId?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TOKEN_MAX_LENGTH = 2048;
const VALID_TOKEN_RE   = /^[A-Za-z0-9\-_+/=.]+$/;

// ─── Internal helpers ─────────────────────────────────────────────────────────

/** Decode the mock JWT payload. Returns null on any error. */
function decodePayload(token: string): Record<string, unknown> | null {
  try {
    const parts      = token.split('.');
    const payloadB64 = parts.length === 3 ? parts[1] : parts[0];
    const decoded    = JSON.parse(Buffer.from(payloadB64, 'base64').toString('utf8'));
    if (decoded && typeof decoded === 'object' && !Array.isArray(decoded)) {
      return decoded as Record<string, unknown>;
    }
  } catch {
    // ignore – caller handles null
  }
  return null;
}

/** Extract and sanitise a user object from a raw decoded payload. */
function sanitiseUser(payload: Record<string, unknown>): AuthUser | null {
  if (!payload.id) return null;
  return {
    id:    String(payload.id).slice(0, 64),
    email: String(payload.email ?? '').slice(0, 254),
    name:  String(payload.name  ?? '').slice(0, 200),
    role:  String(payload.role  ?? 'author').slice(0, 50),
  };
}

function errorResponse(code: string, message: string, detail: string) {
  return {
    success: false,
    error: {
      code,
      message,
      detail,
      resolution: 'Re-authenticate via POST /api/auth/login to obtain a valid token.',
      docs_url:   `https://docs.guttenberg.io/errors/${code}`,
    },
  };
}

// ─── Middleware ───────────────────────────────────────────────────────────────

/**
 * Requires a valid Bearer token. Attaches `req.user` on success.
 * Rejects with 401 on missing, malformed, or expired tokens.
 */
export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json(errorResponse(
      'GUT-4010',
      'Authentication required',
      'No Bearer token found in Authorization header.'
    ));
    return;
  }

  const token = authHeader.slice(7).trim();

  if (token.length > TOKEN_MAX_LENGTH) {
    res.status(401).json(errorResponse(
      'GUT-4012',
      'Invalid token',
      'Token exceeds maximum allowed length.'
    ));
    return;
  }

  if (!VALID_TOKEN_RE.test(token)) {
    res.status(401).json(errorResponse(
      'GUT-4012',
      'Invalid token',
      'Token contains invalid characters.'
    ));
    return;
  }

  const payload = decodePayload(token);
  if (!payload) {
    res.status(401).json(errorResponse(
      'GUT-4012',
      'Invalid token',
      'The provided token could not be decoded.'
    ));
    return;
  }

  if (typeof payload.exp === 'number' && payload.exp < Math.floor(Date.now() / 1000)) {
    res.status(401).json({
      success: false,
      error: {
        code:       'GUT-4011',
        message:    'Token expired',
        detail:     'The provided token has expired.',
        resolution: 'Re-authenticate via POST /api/auth/login to obtain a new token.',
        docs_url:   'https://docs.guttenberg.io/errors/GUT-4011',
      },
    });
    return;
  }

  const user = sanitiseUser(payload);
  if (!user) {
    res.status(401).json(errorResponse(
      'GUT-4012',
      'Invalid token',
      'Token payload is missing required fields.'
    ));
    return;
  }

  req.user = user;
  next();
}

/**
 * Optional auth: if a Bearer token is present it is validated and `req.user`
 * is populated. If no token is present the request proceeds unauthenticated.
 * Malformed or expired tokens still result in a 401.
 */
export function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.headers.authorization) {
    next();
    return;
  }
  authMiddleware(req, res, next);
}

/**
 * Convenience helper to extract the authenticated user ID from a request.
 * Returns null if the request has not been authenticated.
 */
export function getUserId(req: AuthenticatedRequest): string | null {
  return req.user?.id ?? null;
}
