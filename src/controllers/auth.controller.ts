import type { RequestHandler } from 'express';
import { AppError } from '../middleware/error.middleware.js';
import { login as loginService, logout as logoutService } from '../services/auth.service.js';

export const login: RequestHandler = async (request, response, next) => {
  try {
    const { email, password } = request.body ?? {};
    if (typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email.trim()) || typeof password !== 'string' || !password) {
      throw new AppError(400, 'Email and password are required');
    }

    response.json({ success: true, data: await loginService({ email: email.trim(), password }) });
  } catch (error) { next(error); }
};

export const logout: RequestHandler = async (request, response, next) => {
  try {
    if (!request.accessToken) throw new AppError(401, 'Unauthorized');

    await logoutService(request.accessToken);
    response.json({ success: true, message: 'Logout successful' });
  } catch (error) { next(error); }
};