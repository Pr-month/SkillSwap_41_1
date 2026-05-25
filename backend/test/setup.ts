import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as dotenv from 'dotenv';
import * as path from 'path';

import { AppModule } from '../src/app.module';
import cookieParser from 'cookie-parser';
import { Reflector } from '@nestjs/core';

export async function createTestingApp(): Promise<INestApplication> {
  const envPath = path.join(__dirname, '../.env.test.local');
  dotenv.config({ path: envPath, override: true });

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.use(cookieParser());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  await app.init();

  return app;
}
