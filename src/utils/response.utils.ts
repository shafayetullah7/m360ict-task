import type { Response } from 'express';
import type { ApiResponse } from '../types/api.types';

export function buildResponse<T>(
  status: number,
  message: string,
  data?: T | null,
): ApiResponse<T> {
  return {
    success: status >= 200 && status < 400,
    status,
    message,
    data: data === undefined ? null : data,
  };
}

export function sendResponse<T>(
  res: Response,
  status: number,
  message: string,
  data?: T | null,
): void {
  res.status(status).json(buildResponse(status, message, data));
}
