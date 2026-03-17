"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const auth_1 = __importDefault(require("./routes/auth"));
const titles_1 = __importDefault(require("./routes/titles"));
const manuscripts_1 = __importDefault(require("./routes/manuscripts"));
const formats_1 = __importDefault(require("./routes/formats"));
const isbn_1 = __importDefault(require("./routes/isbn"));
const distribution_1 = __importDefault(require("./routes/distribution"));
const finance_1 = __importDefault(require("./routes/finance"));
const marketing_1 = __importDefault(require("./routes/marketing"));
const analytics_1 = __importDefault(require("./routes/analytics"));
const covers_1 = __importDefault(require("./routes/covers"));
const enterprise_1 = __importDefault(require("./routes/enterprise"));
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// ─── Security & utilities ─────────────────────────────────────────────────────
// Helmet: sensible security headers
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false, // disabled so frontend SPA assets aren't blocked in dev
    crossOriginEmbedderPolicy: false,
}));
// CORS: allow only configured origins
const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
    : ['http://localhost:3000', 'http://127.0.0.1:3000'];
app.use((0, cors_1.default)({
    origin: (origin, cb) => {
        // Allow server-to-server (no Origin header) or listed origins
        if (!origin || allowedOrigins.includes(origin))
            return cb(null, true);
        cb(new Error(`CORS: origin '${origin}' not permitted`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use((0, compression_1.default)());
// Use 'combined' in production, 'dev' locally
app.use((0, morgan_1.default)(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
// Tighten body limits: 10 MB max (was 50 MB)
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// ─── Simple rate-limit header (informational; real throttling needs middleware) ─
app.use((_req, res, next) => {
    res.setHeader('X-RateLimit-Policy', '300;w=60');
    next();
});
// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        version: '1.0.0',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV || 'development',
    });
});
// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', auth_1.default);
app.use('/api/titles', titles_1.default);
app.use('/api/manuscripts', manuscripts_1.default);
// Formats: mounted at /api/formats and nested under /api for /api/titles/:id/formats
app.use('/api/formats', formats_1.default);
app.use('/api', formats_1.default);
app.use('/api/isbn', isbn_1.default);
// Distribution: handles /api/channels and /api/titles/:id/distribution
// NOTE: previously mounted twice — now mounted once; both route paths live in distributionRouter
app.use('/api', distribution_1.default);
// Finance: handles /api/finance/* and /api/titles/:id/royalties
app.use('/api/finance', finance_1.default);
app.use('/api', finance_1.default);
// Marketing: handles /api/titles/:id/{landing-page,arc,press-kit,synopsis}
app.use('/api', marketing_1.default);
app.use('/api/analytics', analytics_1.default);
app.use('/api/covers', covers_1.default);
// Enterprise / org routes
app.use('/api/org', enterprise_1.default);
// ─── 404 & Error handlers ─────────────────────────────────────────────────────
app.use(errorHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
// ─── Start server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`🚀 Guttenberg API running on http://localhost:${PORT}`);
    console.log(`   Health:  http://localhost:${PORT}/health`);
    console.log(`   Env:     ${process.env.NODE_ENV || 'development'}`);
});
exports.default = app;
