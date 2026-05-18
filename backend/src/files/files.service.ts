import { Injectable } from '@nestjs/common';

@Injectable()
export class FilesService {
  createFileUrl(file: Express.Multer.File): string {
    return `/public/uploads/${file.filename}`;
  }
}
