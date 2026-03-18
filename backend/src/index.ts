import express, { Request, Response } from 'express';
import cors    from 'cors';
import helmet  from 'helmet';
import morgan  from 'morgan';
import compression from 'compression';
import { v4 as uuidv4 } from 'uuid';

import authRouter         from './routes/auth';
import titlesRouter       from './routes/titles';
import manuscriptsRouter  from './routes/manuscripts';
import formatsRouter      from './routes/formats';
import formatExportRouter from './routes/formatExport';
import isbnRouter         from './routes/isbn';
import distributionRouter from './routes/distribution';
import financeRouter      from './routes/finance';
import marketingRouter    from './routes/marketing';
import analyticsRouter    from './routes/analytics';
import coversRouter       from './routes/covers';
import coverDesignRouter  from './routes/coverDesign';
import pricingRouter      from './routes/pricing';
import authorProfileRouter from './routes/authorProfile';
import enterpriseRouter   from './routes/enterprise';

import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { authRateLimit, generalRateLimit } from './middleware/rateLimit';
import { AuthenticatedRequest } from './middleware/auth';

const app     = express();
const PORT    = process.env.PORT || 3001;
const VERSION = '2.0.0';
const startedAt = Date.now();

// ─── Security & utilities ────────────────────────────────────────────────────

app.use(helmet({
  contentSecurityPolicy:    false, // disabled so frontend SPA assets aren't blocked in dev
  crossOriginEmbedderPolicy: false,
}));

// CORS: allow only configured origins
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin '${origin}' not permitted`));
  },
  credentials:    true,
  methods:        ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  exposedHeaders: ['X-Request-ID', 'X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
}));

app.use(compression());

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Body parsing: 10 MB max
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Request ID middleware ───────────────────────────────────────────────────

app.use((req: AuthenticatedRequest, res: Response, next) => {
  const requestId = (req.headers['x-request-id'] as string) || uuidv4();
  req.requestId   = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
});

// ─── General rate limit (all API routes) ────────────────────────────────────

app.use('/api', generalRateLimit);

// ─── Health check ────────────────────────────────────────────────────────────

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    success:   true,
    data: {
      status:    'ok',
      version:   VERSION,
      uptime:    process.uptime(),
      uptimeMs:  Date.now() - startedAt,
      timestamp: new Date().toISOString(),
      env:       process.env.NODE_ENV || 'development',
    },
  });
});

// Legacy health path kept for backwards compatibility
app.get('/health', (_req: Request, res: Response) => {
  res.redirect(301, '/api/health');
});

// ─── Auth routes (with strict rate limiting) ─────────────────────────────────

app.use('/api/auth', authRateLimit, authRouter);

// ─── Core title & manuscript routes ─────────────────────────────────────────

app.use('/api/titles',      titlesRouter);
app.use('/api/manuscripts', manuscriptsRouter);

// ─── Format routes ───────────────────────────────────────────────────────────

// formatExportRouter handles /api/formats/templates, /api/formats/trim-sizes,
// /api/formats/fonts, /api/formats/preview, and /api/titles/:id/export(s)
app.use('/api/formats',      formatExportRouter);
app.use('/api',              formatExportRouter);

// Legacy formats router (covers /api/formats/:jobId/status and
// the older /api/titles/:id/formats POST endpoint)
app.use('/api/formats',      formatsRouter);
app.use('/api',              formatsRouter);

// ─── ISBN routes ─────────────────────────────────────────────────────────────

app.use('/api/isbn', isbnRouter);

// ─── Distribution routes ─────────────────────────────────────────────────────

// Handles /api/channels and /api/titles/:id/distribution
app.use('/api', distributionRouter);

// ─── Finance routes ──────────────────────────────────────────────────────────

// Handles /api/finance/* and /api/titles/:id/royalties
app.use('/api/finance', financeRouter);
app.use('/api',         financeRouter);

// ─── Marketing routes ────────────────────────────────────────────────────────

// Handles /api/titles/:id/{landing-page,arc,press-kit,synopsis}
app.use('/api', marketingRouter);

// ─── Analytics routes ────────────────────────────────────────────────────────

app.use('/api/analytics', analyticsRouter);

// ─── Cover routes (legacy upload + validate) ─────────────────────────────────

app.use('/api/covers', coversRouter);

// ─── Cover Design routes ─────────────────────────────────────────────────────

// Handles /api/cover-design/* and /api/titles/:id/cover-design
app.use('/api/cover-design', coverDesignRouter);
app.use('/api',              coverDesignRouter);

// ─── Pricing routes ──────────────────────────────────────────────────────────

app.use('/api/pricing', pricingRouter);

// ─── Author Profile routes ───────────────────────────────────────────────────

app.use('/api/author', authorProfileRouter);

// ─── Enterprise / org routes ─────────────────────────────────────────────────

app.use('/api/org', enterpriseRouter);

// ─── 404 & error handlers ────────────────────────────────────────────────────

app.use(notFoundHandler);
app.use(errorHandler);

// ─── Start server ─────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  const base = `http://localhost:${PORT}`;
  console.log(`Guttenberg API v${VERSION} running on ${base}`);
  console.log(`  Health:   ${base}/api/health`);
  console.log(`  Env:      ${process.env.NODE_ENV || 'development'}`);
  console.log(`  Routes:   auth, titles, manuscripts, formats, isbn,`);
  console.log(`            distribution, finance, marketing, analytics,`);
  console.log(`            covers, cover-design, pricing, author, org`);
});

export default app;
