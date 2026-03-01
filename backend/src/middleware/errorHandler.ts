import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  detail?: string;
  resolution?: string;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'GUT-5000';

  res.status(statusCode).json({
    error: {
      code,
      message: err.message || 'An unexpected error occurred',
      detail: err.detail || null,
      resolution: err.resolution || 'Please try again or contact support if the problem persists.',
      docs_url: `https://docs.guttenberg.io/errors/${code}`,
    },
  });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: {
      code: 'GUT-4040',
      message: `Route not found: ${req.method} ${req.path}`,
      detail: 'The requested endpoint does not exist.',
      resolution: 'Check the API documentation for valid endpoints.',
      docs_url: 'https://docs.guttenberg.io/errors/GUT-4040',
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
  err.code = code;
  err.detail = detail;
  err.resolution = resolution;
  return err;
}
