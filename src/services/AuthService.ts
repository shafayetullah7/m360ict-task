import type { LoginBody, LoginResponse } from '../types/auth.types';

export class AuthService {
  async login(_body: LoginBody): Promise<LoginResponse> {
    throw new Error('Not implemented');
  }
}
