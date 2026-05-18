import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('APP_CONFIG', () => ({
  port: Number(process.env.PORT || 3000),
  hashSalt: Number(process.env.HASH_SALT || 10),
}));

export type IAppConfig = ReturnType<typeof appConfig>;
