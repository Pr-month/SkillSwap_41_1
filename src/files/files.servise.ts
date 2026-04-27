import { Injectable } from '@nestjs/common';

@Injectable()
export class FilesService {
  createFileUrl(file: Express.Multer.File): string {
    return `/uploads/${file.filename}`;
  }
}
