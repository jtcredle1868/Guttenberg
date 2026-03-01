"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const mockUsers = [
    {
        id: 'author-001',
        email: 'demo@guttenberg.io',
        password: 'demo123',
        name: 'Eleanor Voss',
        role: 'author',
        avatarUrl: 'https://i.pravatar.cc/150?u=author-001',
    },
    {
        id: 'publisher-001',
        email: 'publisher@guttenberg.io',
        password: 'demo123',
        name: 'Meridian Publishing Group',
        role: 'publisher_admin',
        avatarUrl: 'https://i.pravatar.cc/150?u=publisher-001',
    },
];
function buildToken(user) {
    const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64');
    const payload = Buffer.from(JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 86400 * 7, // 7-day expiry
    })).toString('base64');
    const signature = Buffer.from('mock-signature').toString('base64');
    return `${header}.${payload}.${signature}`;
}
// POST /api/auth/login
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            error: {
                code: 'GUT-4000',
                message: 'Missing credentials',
                detail: 'Both email and password fields are required.',
                resolution: 'Provide email and password in the request body.',
                docs_url: 'https://docs.guttenberg.io/errors/GUT-4000',
            },
        });
    }
    const user = mockUsers.find((u) => u.email === email && u.password === password);
    if (!user) {
        return res.status(401).json({
            error: {
                code: 'GUT-4013',
                message: 'Invalid credentials',
                detail: 'No account found with the provided email/password combination.',
                resolution: 'Check your credentials or reset your password.',
                docs_url: 'https://docs.guttenberg.io/errors/GUT-4013',
            },
        });
    }
    const token = buildToken(user);
    return res.json({
        token,
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            avatarUrl: user.avatarUrl,
        },
        expiresIn: 86400 * 7,
    });
});
// GET /api/auth/verify
router.get('/verify', auth_1.authMiddleware, (req, res) => {
    return res.json({
        valid: true,
        user: req.user,
    });
});
exports.default = router;
