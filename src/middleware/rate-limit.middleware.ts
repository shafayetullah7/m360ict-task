import rateLimit from 'express-rate-limit';

export type RateLimitConfig = {
  windowMs: number;
  max: number;
  message?: string;
};

export function createRateLimiter(config: RateLimitConfig) {
  return rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json({
        error: {
          message: config.message ?? 'Too many requests, please try again later',
        },
      });
    },
  });
}
