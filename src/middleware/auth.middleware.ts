import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env.js';

export const authMiddleware = (request: Request, response: Response, next: NextFunction): void => {
  if (!env.authToken) {
    next();
    return;
  }

  const authorization = request.header('authorization');
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : undefined;

  if (token !== env.authToken) {
    response.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  next();
};
