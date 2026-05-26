import { applyDecorators } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiBadRequestResponse,
} from '@nestjs/swagger';

export const ApiFindAllUsers = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get all users' }),
    ApiOkResponse({ description: 'Return all users' }),
  );

export const ApiGetUser = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get Current user' }),
    ApiOkResponse({ description: 'Return current user' }),
  );

export const ApiGetUserById = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get user by id' }),
    ApiOkResponse({ description: 'Return user by id' }),
    ApiNotFoundResponse({ description: 'User not found.' }),
  );

export const ApiUpdateUser = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Update current user',
      description: 'Can pass the cityId field to update the city.',
    }),
    ApiOkResponse({ description: 'The user has been successfully updated.' }),
    ApiNotFoundResponse({ description: 'User not found.' }),
    ApiBadRequestResponse({ description: 'City not found' }),
  );

export const ApiDeleteUser = () =>
  applyDecorators(
    ApiOperation({ summary: 'Delete user by id' }),
    ApiOkResponse({ description: 'The user has been successfully deleted.' }),
    ApiNotFoundResponse({ description: 'User not found.' }),
  );

export const ApiUpdatePassword = () =>
  applyDecorators(
    ApiOperation({ summary: 'Update password' }),
    ApiOkResponse({ description: 'Password successfully updated' }),
    ApiBadRequestResponse({ description: 'Invalid password' }),
    ApiNotFoundResponse({ description: 'User not found' }),
  );
