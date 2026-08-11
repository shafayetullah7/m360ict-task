import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { buildResponse } from '../utils/response.utils';

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json(buildResponse(err.statusCode, err.message));
    return;
  }

  console.error(err);
  res.status(500).json(buildResponse(500, 'Internal server error'));
}
