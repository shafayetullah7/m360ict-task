import type { JwtPayload } from './auth.types';

export interface ValidatedRequestData {
  body?: unknown;
  query?: unknown;
  params?: unknown;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      validated?: ValidatedRequestData;
    }
  }
}
