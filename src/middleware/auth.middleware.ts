import type { NextFunction, Request, Response } from 'express';
import { supabase } from '../config/supabase.js';
import { AppError } from './error.middleware.js';

declare global {
  namespace Express {
    interface User { id: string; email: string | null; }
    interface Request { user?: User; accessToken?: string; }
  }
}

export const authMiddleware = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
  const authorization = request.header('authorization');
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];

  if (!token) {
    response.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      response.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    request.user = { id: data.user.id, email: data.user.email ?? '' };
    request.accessToken = token;
    next();
  } catch (error) {
    console.error('Supabase token validation failed', error);
    next(new AppError(502, 'Unable to validate authentication token'));
  }
};
