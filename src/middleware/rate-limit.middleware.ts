import rateLimit from 'express-rate-limit';
import { buildResponse } from '../utils/response.utils';

export type RateLimitConfig = {
  windowMs: number;
  max: number;
  message?: string;
};

export function createRateLimiter(config: RateLimitConfig) {
  const message = config.message ?? 'Too many requests, please try again later';

  return rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json(buildResponse(429, message));
    },
  });
}
