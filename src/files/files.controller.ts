import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from './multer.config';
import { FilesService } from './files.servise';
import { Request } from 'express';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', multerConfig))
  upload(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    const result =
      req.protocol +
      '://' +
      req.get('host') +
      this.filesService.createFileUrl(file);
    return { url: result };
  }
}
