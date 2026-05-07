import { applyDecorators } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

export const ApiFindAllUsers = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get all users' }),
    ApiOkResponse({ description: 'Return all users' }),
  );

export const ApiCreateUser = () =>
  applyDecorators(
    ApiOperation({ summary: 'Create a new user' }),
    ApiCreatedResponse({
      description: 'The user has been successfully created.',
    }),
    ApiNotFoundResponse({ description: 'User not found.' }),
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
    ApiOperation({ summary: 'Update current user' }),
    ApiOkResponse({ description: 'The user has been successfully updated.' }),
    ApiNotFoundResponse({ description: 'User not found.' }),
  );

export const ApiDeleteUser = () =>
  applyDecorators(
    ApiOperation({ summary: 'Delete user by id' }),
    ApiOkResponse({ description: 'The user has been successfully deleted.' }),
    ApiNotFoundResponse({ description: 'User not found.' }),
  );
