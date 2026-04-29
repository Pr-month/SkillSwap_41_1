import { Injectable } from '@nestjs/common';

@Injectable()
export class FilesService {
  createFileUrl(file: { filename: string }): string {
    return `/uploads/${file.filename}`;
  }
}
