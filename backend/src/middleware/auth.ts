import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
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

  const token = authHeader.slice(7);

  try {
    // Decode base64-encoded JSON payload (mock JWT – format: header.payload.signature)
    const parts = token.split('.');
    const payloadPart = parts.length === 3 ? parts[1] : parts[0];
    const decoded = JSON.parse(Buffer.from(payloadPart, 'base64').toString('utf8'));

    if (!decoded || !decoded.id) {
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

    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
    };

    next();
  } catch {
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
