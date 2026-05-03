import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AllExceptionsFilter } from './common/filters/all-exception.filter';
import { appConfig, IAppConfig } from './config/app.config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.use(cookieParser());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalFilters(new AllExceptionsFilter());

  const simpleConfigForSwagger = new DocumentBuilder()
    .setTitle('SkillSwapAPI')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, simpleConfigForSwagger);
  SwaggerModule.setup('api', app, document); 
  
  const { port } = app.get<IAppConfig>(appConfig.KEY);
  await app.listen(port);
}
bootstrap().catch((err) => {
  console.error('Failed to start application', err);
  process.exit(1);
});
