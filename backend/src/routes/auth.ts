import { Router, Request, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

const mockUsers = [
  {
    id:        'author-001',
    email:     'demo@guttenberg.io',
    password:  'demo123',
    name:      'Eleanor Voss',
    role:      'author',
    avatarUrl: 'https://i.pravatar.cc/150?u=author-001',
  },
  {
    id:        'publisher-001',
    email:     'publisher@guttenberg.io',
    password:  'demo123',
    name:      'Meridian Publishing Group',
    role:      'publisher_admin',
    avatarUrl: 'https://i.pravatar.cc/150?u=publisher-001',
  },
] as const;

function buildToken(user: (typeof mockUsers)[number]): string {
  const header  = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64');
  const payload = Buffer.from(JSON.stringify({
    id:    user.id,
    email: user.email,
    name:  user.name,
    role:  user.role,
    iat:   Math.floor(Date.now() / 1000),
    exp:   Math.floor(Date.now() / 1000) + 86_400 * 7, // 7-day expiry
  })).toString('base64');
  const signature = Buffer.from('mock-signature').toString('base64');
  return `${header}.${payload}.${signature}`;
}

// Constant-time-ish string comparison to mitigate timing side-channels on demo passwords
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// POST /api/auth/login
router.post('/login', (req: Request, res: Response) => {
  const rawEmail    = req.body?.email;
  const rawPassword = req.body?.password;

  // Type and length validation
  if (
    typeof rawEmail !== 'string'    || rawEmail.length    === 0 ||
    typeof rawPassword !== 'string' || rawPassword.length === 0
  ) {
    res.status(400).json({
      error: {
        code:       'GUT-4000',
        message:    'Missing credentials',
        detail:     'Both email and password fields are required strings.',
        resolution: 'Provide email and password in the request body.',
        docs_url:   'https://docs.guttenberg.io/errors/GUT-4000',
      },
    });
    return;
  }

  // Reject suspiciously long values before any lookup
  if (rawEmail.length > 254 || rawPassword.length > 128) {
    res.status(400).json({
      error: {
        code:       'GUT-4000',
        message:    'Invalid credentials format',
        detail:     'Email or password exceeds maximum allowed length.',
        resolution: 'Provide valid email and password values.',
        docs_url:   'https://docs.guttenberg.io/errors/GUT-4000',
      },
    });
    return;
  }

  const email    = rawEmail.trim().toLowerCase();
  const password = rawPassword;

  const user = mockUsers.find(u => u.email === email && safeEqual(u.password, password));

  if (!user) {
    // Always respond with a generic message to avoid user-enumeration
    res.status(401).json({
      error: {
        code:       'GUT-4013',
        message:    'Invalid credentials',
        detail:     'No account found with the provided email/password combination.',
        resolution: 'Check your credentials or reset your password.',
        docs_url:   'https://docs.guttenberg.io/errors/GUT-4013',
      },
    });
    return;
  }

  const token = buildToken(user);
  res.json({
    token,
    user: {
      id:        user.id,
      email:     user.email,
      name:      user.name,
      role:      user.role,
      avatarUrl: user.avatarUrl,
    },
    expiresIn: 86_400 * 7,
  });
});

// GET /api/auth/verify
router.get('/verify', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  res.json({ valid: true, user: req.user });
});

export default router;
