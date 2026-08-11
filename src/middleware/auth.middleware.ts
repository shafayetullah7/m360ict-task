import type { Request, Response, NextFunction } from 'express';

// Phase 5: JWT authentication middleware
export function authMiddleware(_req: Request, _res: Response, next: NextFunction): void {
  next();
}
