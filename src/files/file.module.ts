import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.servise';

@Module({
  controllers: [FilesController],
  providers: [FilesService],
})
export class FilesModule {}
