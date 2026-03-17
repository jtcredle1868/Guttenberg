"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const TOKEN_MAX_LENGTH = 2048; // guard against oversized tokens
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
            error: {
                code: 'GUT-4010',
                message: 'Authentication required',
                detail: 'No Bearer token found in Authorization header.',
                resolution: 'Include a valid Bearer token in the Authorization header.',
                docs_url: 'https://docs.guttenberg.io/errors/GUT-4010',
            },
        });
        return;
    }
    const token = authHeader.slice(7).trim();
    // Reject tokens that are obviously too large (prevents ReDoS / memory abuse)
    if (token.length > TOKEN_MAX_LENGTH) {
        res.status(401).json({
            error: {
                code: 'GUT-4012',
                message: 'Invalid token',
                detail: 'Token exceeds maximum allowed length.',
                resolution: 'Re-authenticate via POST /api/auth/login.',
                docs_url: 'https://docs.guttenberg.io/errors/GUT-4012',
            },
        });
        return;
    }
    // Reject obviously malformed tokens (only alphanumeric, dash, underscore, dot, plus, slash, equals)
    if (!/^[A-Za-z0-9\-_+/=.]+$/.test(token)) {
        res.status(401).json({
            error: {
                code: 'GUT-4012',
                message: 'Invalid token',
                detail: 'Token contains invalid characters.',
                resolution: 'Re-authenticate via POST /api/auth/login.',
                docs_url: 'https://docs.guttenberg.io/errors/GUT-4012',
            },
        });
        return;
    }
    try {
        // Decode base64-encoded JSON payload (mock JWT – format: header.payload.signature)
        const parts = token.split('.');
        const payloadPart = parts.length === 3 ? parts[1] : parts[0];
        const decoded = JSON.parse(Buffer.from(payloadPart, 'base64').toString('utf8'));
        if (!decoded || typeof decoded !== 'object' || !decoded.id) {
            throw new Error('Invalid token payload');
        }
        // Check expiry if present
        if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
            res.status(401).json({
                error: {
                    code: 'GUT-4011',
                    message: 'Token expired',
                    detail: 'The provided token has expired.',
                    resolution: 'Re-authenticate via POST /api/auth/login to obtain a new token.',
                    docs_url: 'https://docs.guttenberg.io/errors/GUT-4011',
                },
            });
            return;
        }
        // Attach a minimal, sanitised user object — never propagate raw decoded payload
        req.user = {
            id: String(decoded.id).slice(0, 64),
            email: String(decoded.email || '').slice(0, 254),
            name: String(decoded.name || '').slice(0, 200),
            role: String(decoded.role || 'author').slice(0, 50),
        };
        next();
    }
    catch {
        res.status(401).json({
            error: {
                code: 'GUT-4012',
                message: 'Invalid token',
                detail: 'The provided token could not be decoded.',
                resolution: 'Re-authenticate via POST /api/auth/login to obtain a valid token.',
                docs_url: 'https://docs.guttenberg.io/errors/GUT-4012',
            },
        });
    }
}
