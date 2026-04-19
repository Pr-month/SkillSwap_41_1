import { registerAs } from '@nestjs/config';
import type { StringValue } from 'ms';

export const jwtConfig = registerAs('JWT_CONFIG', () => ({
  accessSecret: process.env.JWT_ACCESS_SECRET || 'access-secret-key',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-key',
  accessExpiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || '1h') as StringValue,
  refreshExpiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as StringValue,
}));

export type IJwtConfig = ReturnType<typeof jwtConfig>;
