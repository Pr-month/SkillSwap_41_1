import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from './multer.config';
import { FilesService } from './files.servise';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', multerConfig))
  upload(@UploadedFile() file: unknown) {
    const uploadedFile = file as { filename: string };
    return { url: this.filesService.createFileUrl(uploadedFile) };
  }
}
