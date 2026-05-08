import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { multerConfig } from './multer.config';
import { FilesService } from './files.service';
import { ApiTags } from '@nestjs/swagger';
import { ApiUploadFile } from './swagger/files.swagger';

@ApiTags('files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post()
  @ApiUploadFile()
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
