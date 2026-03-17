import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  detail?: string;
  resolution?: string;
}

const IS_PROD = process.env.NODE_ENV === 'production';

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const code       = err.code       || 'GUT-5000';

  // In production, mask internal details from 5xx responses
  const isInternal  = statusCode >= 500;
  const message     = isInternal && IS_PROD ? 'An unexpected error occurred' : (err.message || 'An unexpected error occurred');
  const detail      = isInternal && IS_PROD ? null : (err.detail || null);
  const resolution  = err.resolution || 'Please try again or contact support if the problem persists.';

  // Log full error server-side regardless of env
  if (isInternal) {
    console.error(`[${code}] ${req.method} ${req.path}`, err);
  }

  res.status(statusCode).json({
    error: {
      code,
      message,
      detail,
      resolution,
      docs_url: `https://docs.guttenberg.io/errors/${code}`,
    },
  });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: {
      code:       'GUT-4040',
      message:    `Route not found: ${req.method} ${req.path}`,
      detail:     'The requested endpoint does not exist.',
      resolution: 'Check the API documentation for valid endpoints.',
      docs_url:   'https://docs.guttenberg.io/errors/GUT-4040',
    },
  });
}

export function createError(
  statusCode: number,
  code: string,
  message: string,
  detail?: string,
  resolution?: string
): AppError {
  const err: AppError = new Error(message);
  err.statusCode = statusCode;
  err.code       = code;
  err.detail     = detail;
  err.resolution = resolution;
  return err;
}
