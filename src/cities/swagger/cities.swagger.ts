import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

export const ApiCreateCity = () =>
  applyDecorators(
    ApiOperation({ summary: 'Create a new city' }),
    ApiCreatedResponse({ description: 'City successfully created' }),
    ApiBadRequestResponse({ description: 'Invalid city name or duplicate entry' }),
  );

export const ApiFindAllCities = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get all cities with optional search' }),
    ApiOkResponse({ description: 'List of cities' }),
  );

export const ApiFindOneCity = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get a city by ID' }),
    ApiOkResponse({ description: 'City found' }),
    ApiNotFoundResponse({ description: 'City not found' }),
  );

export const ApiUpdateCity = () =>
  applyDecorators(
    ApiOperation({ summary: 'Update a city' }),
    ApiOkResponse({ description: 'City successfully updated' }),
    ApiBadRequestResponse({ description: 'Invalid city name or duplicate entry' }),
    ApiNotFoundResponse({ description: 'City not found' }),
  );

export const ApiDeleteCity = () =>
  applyDecorators(
    ApiOperation({ summary: 'Delete a city' }),
    ApiOkResponse({ description: 'City successfully deleted' }),
    ApiNotFoundResponse({ description: 'City not found' }),
  );
