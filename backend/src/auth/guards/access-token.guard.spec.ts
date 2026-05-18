import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test } from '@nestjs/testing';
import { Request } from 'express';

import { jwtConfig } from '../../config/jwt.config';
import { AccessTokenStrategy } from '../strategies/access-token.strategy';
import { AccessTokenGuard } from './access-token.guard';

const ACCESS_SECRET = 'test-access-secret';

const buildContext = (req: Partial<Request>): ExecutionContext =>
  ({
    switchToHttp: () => ({
      getRequest: () => req,
      getResponse: () => ({}),
    }),
  }) as unknown as ExecutionContext;

describe('AccessTokenGuard', () => {
  let guard: AccessTokenGuard;
  let jwtService: JwtService;

  beforeEach(async () => {
    process.env.JWT_ACCESS_SECRET = ACCESS_SECRET;

    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forFeature(jwtConfig),
        PassportModule,
        JwtModule.register({}),
      ],
      providers: [AccessTokenStrategy, AccessTokenGuard],
    }).compile();

    guard = moduleRef.get(AccessTokenGuard);
    jwtService = moduleRef.get(JwtService);
  });

  it('allows the request when a valid access token is in the cookie', async () => {
    const token = jwtService.sign(
      { sub: 'user-1', email: 'user-1@example.com', role: 'USER' },
      { secret: ACCESS_SECRET, expiresIn: '1h' },
    );
    const ctx = buildContext({ cookies: { accessToken: token } });

    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });

  it('throws UnauthorizedException when the cookie is missing', async () => {
    const ctx = buildContext({ cookies: {} });

    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException when the token is invalid', async () => {
    const ctx = buildContext({ cookies: { accessToken: 'invalid-token' } });

    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });
});
