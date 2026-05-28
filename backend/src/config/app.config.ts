import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('APP_CONFIG', () => ({
  port: Number(process.env.PORT || 3000),
  hashSalt: Number(process.env.HASH_SALT || 10),
  frontHost: process.env.FRONT_HOST || 'http://localhost:8080',
}));

export type IAppConfig = ReturnType<typeof appConfig>;
