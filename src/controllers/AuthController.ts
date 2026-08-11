import type { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import type { LoginBody } from '../types/auth.types';
import { toHandler } from '../types/request.types';
import { sendResponse } from '../utils/response.utils';

export class AuthController {
  private readonly service = new AuthService();

  login = toHandler(
    async (req: Request<Record<string, never>, unknown, LoginBody>, res: Response) => {
      const result = await this.service.login(req.body);
      sendResponse(res, 200, 'Login successful', result);
    },
  );
}
