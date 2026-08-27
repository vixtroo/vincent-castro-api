import multer from 'multer';
import { AppError } from './error.middleware.js';

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

export const projectImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_request, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(new AppError(400, 'Project image must be JPG, PNG, or WebP'));
      return;
    }
    callback(null, true);
  },
});