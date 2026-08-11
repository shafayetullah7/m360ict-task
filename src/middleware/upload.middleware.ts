import fs from 'fs';
import path from 'path';
import type { Request, Response, NextFunction } from 'express';
import multer, { MulterError } from 'multer';
import env from '../config/env';
import { ValidationError } from '../utils/errors';

const uploadDir = path.resolve(env.UPLOAD_PATH);

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const photoUpload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(null, true);
      return;
    }

    cb(new Error('Photo must be a JPEG, PNG, or WebP image'));
  },
});

function toValidationError(err: unknown): Error {
  if (err instanceof ValidationError) {
    return err;
  }

  if (err instanceof MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return new ValidationError('Photo must be 5MB or smaller');
    }

    return new ValidationError(err.message);
  }

  if (err instanceof Error) {
    return new ValidationError(err.message);
  }

  return new ValidationError('Invalid photo upload');
}

export function uploadPhoto(req: Request, res: Response, next: NextFunction): void {
  photoUpload.single('photo')(req, res, (err: unknown) => {
    if (err) {
      next(toValidationError(err));
      return;
    }

    next();
  });
}
