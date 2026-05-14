import { applyDecorators } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';

export const ApiGetSimilarUsersForSkill = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get users with skills in the same category' }),
    ApiParam({ name: 'id', description: 'Skill id' }),
    ApiOkResponse({ description: 'List of users' }),
    ApiNotFoundResponse({ description: 'Skill not found' }),
  );
