import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { createRateLimiter } from '../middleware/rate-limit.middleware';
import { validate } from '../middleware/validate.middleware';
import { loginSchema } from '../validators/auth.validator';

const router = Router();
const controller = new AuthController();

const rateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many login attempts, please try again later',
});

router.post('/login', rateLimiter, validate(loginSchema), controller.login);

export default router;
