import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { UserRole } from '../../users/entities/enums/users.enums';
import { JwtPayload } from '../auth.types';
import { RolesGuard } from './roles.guard';

const buildContext = (user: JwtPayload): ExecutionContext =>
  ({
    getHandler: () => () => undefined,
    getClass: () => class {},
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  }) as unknown as ExecutionContext;

const buildUser = (role: UserRole): JwtPayload => ({
  sub: 'user-1',
  email: 'user-1@example.com',
  role,
});

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;

    guard = new RolesGuard(reflector);
  });

  it('allows the request when no roles are required', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const ctx = buildContext(buildUser(UserRole.USER));

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('allows the request when the user role matches the required roles', () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);
    const ctx = buildContext(buildUser(UserRole.ADMIN));

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('allows the request when the user role is one of several required roles', () => {
    reflector.getAllAndOverride.mockReturnValue([
      UserRole.ADMIN,
      UserRole.USER,
    ]);
    const ctx = buildContext(buildUser(UserRole.USER));

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('throws ForbiddenException when the user role is not in the required roles', () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);
    const ctx = buildContext(buildUser(UserRole.USER));

    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });
});
