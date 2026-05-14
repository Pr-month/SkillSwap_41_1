import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';

const storage = diskStorage({
  destination: './public/uploads',
  filename: (
    _req,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void,
  ) => {
    const uniqueName = uuid();
    cb(null, uniqueName + extname(file.originalname));
  },
});

const limits = {
  fileSize: 2 * 1024 * 1024,
};

const allowed = ['image/jpeg', 'image/png', 'image/webp'];

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: (arg0: Error | null, arg1: boolean) => void,
) => {
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
export const multerConfig: MulterOptions = {
  storage,
  limits,
  fileFilter,
};
