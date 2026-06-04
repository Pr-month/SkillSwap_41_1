import { registerAs } from '@nestjs/config';

export const mailConfig = registerAs('MAIL_CONFIG', () => ({
  baseUrl: process.env.MAIL_SERVICE_URL || 'http://localhost:3001',
}));

export type IMailConfig = ReturnType<typeof mailConfig>;
