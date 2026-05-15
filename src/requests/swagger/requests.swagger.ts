import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request } from '../entities/request.entity';

export const ApiCreateRequest = () =>
  applyDecorators(
    ApiOperation({ summary: 'Create a new request' }),
    ApiCreatedResponse({
      description: 'Request created successfully',
      type: Request,
    }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiBadRequestResponse({ description: 'Invalid input data' }),
  );

export const ApiGetAllRequests = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get all requests' }),
    ApiOkResponse({
      description: 'List of all requests',
      type: [Request],
    }),
  );

export const ApiGetOutgoingRequests = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get outgoing requests for authenticated user' }),
    ApiOkResponse({
      description: 'List of outgoing requests',
      type: [Request],
    }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );

export const ApiGetIncomingRequests = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get incoming requests for authenticated user' }),
    ApiOkResponse({
      description: 'List of incoming requests',
      type: [Request],
    }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );

export const ApiGetRequestById = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get a request by ID' }),
    ApiParam({ name: 'id', description: 'Request id', type: String }),
    ApiOkResponse({
      description: 'Request found',
      type: Request,
    }),
    ApiNotFoundResponse({ description: 'Request not found' }),
  );

export const ApiUpdateRequest = () =>
  applyDecorators(
    ApiOperation({ summary: 'Update a request status' }),
    ApiParam({ name: 'id', description: 'Request id', type: String }),
    ApiOkResponse({
      description: 'Request updated successfully',
      type: Request,
    }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiNotFoundResponse({ description: 'Request not found' }),
    ApiBadRequestResponse({ description: 'Invalid status value' }),
  );

export const ApiDeleteRequest = () =>
  applyDecorators(
    ApiOperation({ summary: 'Delete a request' }),
    ApiParam({ name: 'id', description: 'Request id', type: String }),
    ApiOkResponse({ description: 'Request deleted successfully' }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiNotFoundResponse({ description: 'Request not found' }),
  );
