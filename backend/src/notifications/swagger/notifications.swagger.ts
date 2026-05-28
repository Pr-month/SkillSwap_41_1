import { applyDecorators } from '@nestjs/common';
import { Notification } from '../entities/notification.entity';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export const ApiFindMyNotifications = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get my notifications' }),
    ApiOkResponse({
      description: 'Notifications for the authenticated user',
      type: [Notification],
    }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );

export const ApiMarkAsReadNotification = () => 
  applyDecorators(
    ApiOperation({ summary: 'Mark notification as read' }),
    ApiParam({ name: 'id', type: String }),
    ApiOkResponse({
      description: 'Notification marked as read',
      type: Notification,
    }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiNotFoundResponse({ description: 'Notification not found' }),
  );
