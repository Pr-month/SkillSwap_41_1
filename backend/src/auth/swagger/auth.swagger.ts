import { applyDecorators } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export const ApiRegister = () =>
  applyDecorators(
    ApiOperation({ summary: 'Register a new user' }),
    ApiCreatedResponse({
      description: 'User registered. Tokens set as httpOnly cookies.',
    }),
  );

export const ApiLogin = () =>
  applyDecorators(
    ApiOperation({ summary: 'Log in' }),
    ApiOkResponse({
      description: 'Logged in. Tokens set as httpOnly cookies.',
    }),
    ApiUnauthorizedResponse({ description: 'Invalid email or password' }),
  );

export const ApiLogout = () =>
  applyDecorators(
    ApiCookieAuth('accessToken'),
    ApiOperation({ summary: 'Log out' }),
    ApiOkResponse({ description: 'Logged out successfully' }),
    ApiUnauthorizedResponse({
      description: 'Missing or invalid access token',
    }),
  );

export const ApiRefresh = () =>
  applyDecorators(
    ApiCookieAuth('refreshToken'),
    ApiOperation({ summary: 'Refresh access and refresh tokens' }),
    ApiOkResponse({ description: 'Tokens refreshed successfully' }),
    ApiUnauthorizedResponse({
      description: 'Missing, invalid, expired or revoked refresh token',
    }),
  );
