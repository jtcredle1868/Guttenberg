import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';

import authRouter        from './routes/auth';
import titlesRouter      from './routes/titles';
import manuscriptsRouter from './routes/manuscripts';
import formatsRouter     from './routes/formats';
import isbnRouter        from './routes/isbn';
import distributionRouter from './routes/distribution';
import financeRouter     from './routes/finance';
import marketingRouter   from './routes/marketing';
import analyticsRouter   from './routes/analytics';
import coversRouter      from './routes/covers';
import enterpriseRouter  from './routes/enterprise';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

const app  = express();
const PORT = process.env.PORT || 3001;

// ─── Security & utilities ─────────────────────────────────────────────────────

// Helmet: sensible security headers
app.use(helmet({
  contentSecurityPolicy: false, // disabled so frontend SPA assets aren't blocked in dev
  crossOriginEmbedderPolicy: false,
}));

// CORS: allow only configured origins
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];

app.use(cors({
  origin: (origin, cb) => {
    // Allow server-to-server (no Origin header) or listed origins
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin '${origin}' not permitted`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(compression());

// Use 'combined' in production, 'dev' locally
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Tighten body limits: 10 MB max (was 50 MB)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Simple rate-limit header (informational; real throttling needs middleware) ─
app.use((_req, res, next) => {
  res.setHeader('X-RateLimit-Policy', '300;w=60');
  next();
});

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status:    'ok',
    version:   '1.0.0',
    uptime:    process.uptime(),
    timestamp: new Date().toISOString(),
    env:       process.env.NODE_ENV || 'development',
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',         authRouter);
app.use('/api/titles',       titlesRouter);
app.use('/api/manuscripts',  manuscriptsRouter);

// Formats: mounted at /api/formats and nested under /api for /api/titles/:id/formats
app.use('/api/formats',      formatsRouter);
app.use('/api',              formatsRouter);

app.use('/api/isbn',         isbnRouter);

// Distribution: handles /api/channels and /api/titles/:id/distribution
// NOTE: previously mounted twice — now mounted once; both route paths live in distributionRouter
app.use('/api',              distributionRouter);

// Finance: handles /api/finance/* and /api/titles/:id/royalties
app.use('/api/finance',      financeRouter);
app.use('/api',              financeRouter);

// Marketing: handles /api/titles/:id/{landing-page,arc,press-kit,synopsis}
app.use('/api',              marketingRouter);
app.use('/api/analytics',    analyticsRouter);
app.use('/api/covers',       coversRouter);

// Enterprise / org routes
app.use('/api/org',          enterpriseRouter);

// ─── 404 & Error handlers ─────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ─── Start server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Guttenberg API running on http://localhost:${PORT}`);
  console.log(`   Health:  http://localhost:${PORT}/health`);
  console.log(`   Env:     ${process.env.NODE_ENV || 'development'}`);
});

export default app;
