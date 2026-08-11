import { Router } from 'express';
import { createRateLimiter } from '../middleware/rate-limit.middleware';
import { AuthService } from '../services/AuthService';
import { validate } from '../middleware/validate.middleware';
import { loginSchema } from '../validators/auth.validator';
import type { LoginBody } from '../types/auth.types';

const router = Router();
const authService = new AuthService();

const rateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many login attempts, please try again later',
});

router.post('/login', rateLimiter, validate(loginSchema), async (req, res) => {
  const body = req.validated?.body as LoginBody;
  const result = await authService.login(body);
  res.status(200).json(result);
});

export default router;
