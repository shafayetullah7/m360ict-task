import fs from 'fs';
import path from 'path';
import multer from 'multer';
import env from '../config/env';

const uploadDir = path.resolve(env.UPLOAD_PATH);

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

export const uploadPhoto = multer({ storage }).single('photo');
