import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiConflictResponse,
  ApiCookieAuth,
} from '@nestjs/swagger';

export const ApiCreateSkill = () =>
  applyDecorators(
    ApiCookieAuth('accessToken'),
    ApiOperation({
      summary: 'Create a skill',
      description: 'Create a new skill for authorized user.',
    }),
    ApiCreatedResponse({ description: 'Skill successfully created' }),
    ApiUnauthorizedResponse({ description: 'Missing or invalid access token' }),
    ApiNotFoundResponse({ description: 'Category not found' }),
    ApiConflictResponse({ description: 'Resource already exists' }),
  );

export const ApiFindAllSkills = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get all skills',
      description: 'Get list of skills.',
    }),
    ApiOkResponse({ description: 'Returns skills' }),
    ApiNotFoundResponse({ description: 'Page not found' }),
  );

export const ApiFindOneSkill = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get skill by id',
      description: 'Get one skill with owner and category.',
    }),
    ApiOkResponse({ description: 'Returns skill' }),
    ApiNotFoundResponse({ description: 'Skill not found' }),
  );

export const ApiUpdateSkill = () =>
  applyDecorators(
    ApiCookieAuth('accessToken'),
    ApiOperation({
      summary: 'Update a skill',
      description: 'Update skill by id. Only owner can update it.',
    }),
    ApiOkResponse({ description: 'Skill successfully updated' }),
    ApiUnauthorizedResponse({ description: 'Missing or invalid access token' }),
    ApiForbiddenResponse({ description: 'Insufficient rights' }),
    ApiNotFoundResponse({ description: 'Entity not found' }),
  );

export const ApiRemoveSkill = () =>
  applyDecorators(
    ApiCookieAuth('accessToken'),
    ApiOperation({
      summary: 'Delete a skill',
      description: 'Delete skill by id. Only owner can delete it.',
    }),
    ApiOkResponse({ description: 'Skill deleted' }),
    ApiUnauthorizedResponse({ description: 'Missing or invalid access token' }),
    ApiForbiddenResponse({
      description: 'You cannot delete this skill',
    }),
    ApiNotFoundResponse({ description: 'Skill not found' }),
  );

export const ApiAddToFavoriteSkill = () =>
  applyDecorators(
    ApiCookieAuth('accessToken'),
    ApiOperation({
      summary: 'Add skill to favorites',
      description: 'Add skill to authorized user favorites.',
    }),
    ApiOkResponse({ description: 'Skill successfully added to favorites' }),
    ApiUnauthorizedResponse({ description: 'Missing or invalid access token' }),
    ApiNotFoundResponse({ description: 'Skill not found or User not found' }),
    ApiConflictResponse({ description: 'Skill is already in favorites' }),
  );
