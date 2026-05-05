import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test } from '@nestjs/testing';
import { Request } from 'express';

import { jwtConfig } from '../../config/jwt.config';
import { RefreshTokenStrategy } from '../strategies/refresh-token.strategy';
import { RefreshTokenGuard } from './refresh-token.guard';

const REFRESH_SECRET = 'test-refresh-secret';

const buildContext = (req: Partial<Request>): ExecutionContext =>
  ({
    switchToHttp: () => ({
      getRequest: () => req,
      getResponse: () => ({}),
    }),
  }) as unknown as ExecutionContext;

describe('RefreshTokenGuard', () => {
  let guard: RefreshTokenGuard;
  let jwtService: JwtService;

  beforeEach(async () => {
    process.env.JWT_REFRESH_SECRET = REFRESH_SECRET;

    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forFeature(jwtConfig),
        PassportModule,
        JwtModule.register({}),
      ],
      providers: [RefreshTokenStrategy, RefreshTokenGuard],
    }).compile();

    guard = moduleRef.get(RefreshTokenGuard);
    jwtService = moduleRef.get(JwtService);
  });

  it('allows the request when a valid refresh token is in the cookie', async () => {
    const token = jwtService.sign(
      { sub: 'user-1', email: 'user-1@example.com', role: 'USER' },
      { secret: REFRESH_SECRET, expiresIn: '7d' },
    );
    const ctx = buildContext({ cookies: { refreshToken: token } });

    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });

  it('throws UnauthorizedException when the cookie is missing', async () => {
    const ctx = buildContext({ cookies: {} });

    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException when the token is invalid', async () => {
    const ctx = buildContext({ cookies: { refreshToken: 'invalid-token' } });

    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });
});
