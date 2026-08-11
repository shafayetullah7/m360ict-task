import type { Request, Response } from 'express';
import { sendResponse } from '../utils/response.utils';

export class HealthController {
  getStatus = (_req: Request, res: Response): void => {
    sendResponse(res, 200, 'API is running');
  };
}
