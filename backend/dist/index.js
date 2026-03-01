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
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
}));
app.use((0, compression_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
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
app.use('/api/auth', auth_1.default);
app.use('/api/titles', titles_1.default);
app.use('/api/manuscripts', manuscripts_1.default);
// Formats: dual mount – /api/formats/:id and /api/titles/:id/formats
app.use('/api/formats', formats_1.default);
app.use('/api', formats_1.default); // catches /api/titles/:id/formats
app.use('/api/isbn', isbn_1.default);
// Distribution: dual mount – /api/channels and /api/titles/:id/distribution
app.use('/api', distribution_1.default);
app.use('/api', distribution_1.default); // /api/channels already handled above
app.use('/api/finance', finance_1.default);
app.use('/api', finance_1.default); // catches /api/titles/:id/royalties
app.use('/api', marketing_1.default); // catches /api/titles/:id/landing-page, arc, press-kit, synopsis
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
    console.log(`   Health: http://localhost:${PORT}/health`);
    console.log(`   Docs:   https://docs.guttenberg.io/api`);
});
exports.default = app;
