import type { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../errors/index.js';
import { config } from '../config/index.js';

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: 'Endpoint not found' });
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Error:', err.message);

  if (err instanceof AppError) {
    const response: { error: string; retryAfter?: number; details?: string } = {
      error: err.message,
    };

    if (err instanceof ValidationError) {
      response.details = 'Check your request parameters and try again';
    }

    if ('retryAfter' in err && typeof err.retryAfter === 'number') {
      response.retryAfter = err.retryAfter;
    }

    res.status(err.statusCode).json(response);
    return;
  }

  if (err.message === 'Not allowed by CORS') {
    res.status(403).json({ error: 'CORS policy violation' });
    return;
  }

  res.status(500).json({
    error: config.NODE_ENV === 'development' ? err.message : 'Internal server error',
  });
}
