import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import db from '../config/db';
import env from '../config/env';
import type { LoginBody, LoginResponse, Staff } from '../types/auth.types';
import { UnauthorizedError } from '../utils/errors';

export class AuthService {
  async login(body: LoginBody): Promise<LoginResponse> {
    const staff = await db<Staff>('staff').where({ email: body.email }).first();

    if (!staff) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const passwordValid = await argon2.verify(staff.password_hash, body.password);

    if (!passwordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = jwt.sign(
      { staffId: staff.id, email: staff.email },
      env.JWT.SECRET,
      { expiresIn: env.JWT.EXPIRES_IN },
    );

    return {
      token,
      staff: {
        id: staff.id,
        email: staff.email,
        name: staff.name,
      },
    };
  }
}
