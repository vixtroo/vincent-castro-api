import type { ErrorRequestHandler, RequestHandler } from 'express';
import { MulterError } from 'multer';

export class AppError extends Error {
  constructor(public readonly statusCode: number, message: string) {
    super(message);
    this.name = 'AppError';
  }
}

export const notFoundMiddleware: RequestHandler = (_request, response) => {
  response.status(404).json({ success: false, message: 'Route not found' });
};

export const errorMiddleware: ErrorRequestHandler = (error, _request, response, _next) => {
  const statusCode = error instanceof AppError ? error.statusCode : error instanceof MulterError ? 400 : 500;
  const multerMessage = error instanceof MulterError && error.code === 'LIMIT_FILE_SIZE' ? 'Project image must be 5MB or smaller' : 'Invalid multipart request';
  const message = error instanceof AppError
    ? error.message
    : error instanceof MulterError
      ? multerMessage
      : error instanceof Error
        ? error.message
        : 'Internal server error';

  if (statusCode === 500) {
    console.error(error);
  }

  response.status(statusCode).json({ success: false, message });
};
