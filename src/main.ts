import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { ConfigType } from '@nestjs/config';
import { AllExceptionsFilter } from './common/filters/all-exception.filter';
import { appConfig } from './config/app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.use(cookieParser());
  app.useGlobalFilters(new AllExceptionsFilter());

  const { port } = app.get<ConfigType<typeof appConfig>>(appConfig.KEY);
  await app.listen(port);
}
bootstrap().catch((err) => {
  console.error('Failed to start application', err);
  process.exit(1);
});
