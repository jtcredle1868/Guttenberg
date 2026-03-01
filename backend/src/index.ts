import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';

import authRouter from './routes/auth';
import titlesRouter from './routes/titles';
import manuscriptsRouter from './routes/manuscripts';
import formatsRouter from './routes/formats';
import isbnRouter from './routes/isbn';
import distributionRouter from './routes/distribution';
import financeRouter from './routes/finance';
import marketingRouter from './routes/marketing';
import analyticsRouter from './routes/analytics';
import coversRouter from './routes/covers';
import enterpriseRouter from './routes/enterprise';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Security & utilities ─────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  })
);
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/titles', titlesRouter);
app.use('/api/manuscripts', manuscriptsRouter);

// Formats: dual mount – /api/formats/:id and /api/titles/:id/formats
app.use('/api/formats', formatsRouter);
app.use('/api', formatsRouter);           // catches /api/titles/:id/formats

app.use('/api/isbn', isbnRouter);

// Distribution: dual mount – /api/channels and /api/titles/:id/distribution
app.use('/api', distributionRouter);
app.use('/api', distributionRouter);      // /api/channels already handled above

app.use('/api/finance', financeRouter);
app.use('/api', financeRouter);           // catches /api/titles/:id/royalties

app.use('/api', marketingRouter);         // catches /api/titles/:id/landing-page, arc, press-kit, synopsis
app.use('/api/analytics', analyticsRouter);
app.use('/api/covers', coversRouter);

// Enterprise / org routes
app.use('/api/org', enterpriseRouter);

// ─── 404 & Error handlers ─────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ─── Start server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Guttenberg API running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   Docs:   https://docs.guttenberg.io/api`);
});

export default app;
