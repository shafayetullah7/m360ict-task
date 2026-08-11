import { Router } from 'express';
import { loginRateLimiter } from '../middleware/login-rate-limit.middleware';
import { AuthService } from '../services/AuthService';
import { validate } from '../middleware/validate.middleware';
import { loginSchema } from '../validators/auth.validator';
import type { LoginBody } from '../types/auth.types';

const router = Router();
const authService = new AuthService();

router.post('/login', loginRateLimiter, validate(loginSchema), async (req, res) => {
  const body = req.validated?.body as LoginBody;
  const result = await authService.login(body);
  res.status(200).json(result);
});

export default router;
