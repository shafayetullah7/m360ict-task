import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import env from '../config/env';
import type { JwtPayload } from '../types/auth.types';
import { UnauthorizedError } from '../utils/errors';

function isJwtPayload(value: unknown): value is JwtPayload {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as JwtPayload).staffId === 'number' &&
    typeof (value as JwtPayload).email === 'string'
  );
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    next(new UnauthorizedError('Authorization token required'));
    return;
  }

  const token = header.slice(7);

  try {
    const decoded = jwt.verify(token, env.JWT.SECRET);

    if (!isJwtPayload(decoded)) {
      next(new UnauthorizedError('Invalid token'));
      return;
    }

    req.user = {
      staffId: decoded.staffId,
      email: decoded.email,
    };
    next();
  } catch {
    next(new UnauthorizedError('Invalid or expired token'));
  }
}
