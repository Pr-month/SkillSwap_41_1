import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

export const ApiCreateCategory = () =>
  applyDecorators(
    ApiOperation({ summary: 'Create a category' }),
    ApiCreatedResponse({ description: 'Category successfully created' }),
    ApiNotFoundResponse({ description: 'Parent category not found' }),
  );

export const ApiFindAllCategories = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get all parent categories with their children' }),
    ApiOkResponse({ description: 'List of parent categories with children' }),
  );

export const ApiUpdateCategory = () =>
  applyDecorators(
    ApiOperation({ summary: 'Update a category' }),
    ApiOkResponse({ description: 'Category successfully updated' }),
    ApiBadRequestResponse({ description: 'Category cannot be its own parent' }),
    ApiNotFoundResponse({
      description: 'Category or parent category not found',
    }),
  );

export const ApiRemoveCategory = () =>
  applyDecorators(
    ApiOperation({ summary: 'Delete a category' }),
    ApiOkResponse({ description: 'Category successfully deleted' }),
    ApiBadRequestResponse({
      description: 'Category has children and cannot be deleted',
    }),
    ApiNotFoundResponse({ description: 'Category not found' }),
  );
