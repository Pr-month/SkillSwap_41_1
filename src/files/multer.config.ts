import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage, type File as MulterFile } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';

// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
const storage = diskStorage({
  destination: './public/uploads',
  filename: (
    _req,
    file: MulterFile,
    cb: (error: Error | null, filename: string) => void,
  ) => {
    const uniqueName = uuid();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    cb(null, uniqueName + extname(file.originalname));
  },
});

const limits = {
  fileSize: 2 * 1024 * 1024,
};

const allowed = ['image/jpeg', 'image/png', 'image/webp'];

const fileFilter = (
  _req: Request,
  file: MulterFile,
  cb: (arg0: Error | null, arg1: boolean) => void,
) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};
export const multerConfig: MulterOptions = {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  storage,
  limits,
  fileFilter,
};
