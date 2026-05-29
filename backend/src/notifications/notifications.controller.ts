import { Controller, Patch, Param, UseGuards, Req, Get } from '@nestjs/common';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { NotificationsService } from './notifications.service';
import { IRequestWithUser } from 'src/auth/auth.types';
import { ApiTags } from '@nestjs/swagger';
import {
  ApiFindMyNotifications,
  ApiMarkAsReadNotification,
  ApiMarkAllAsReadNotifications
} from './swagger/notifications.swagger';

@Controller('notifications')
@ApiTags('notifications')
@UseGuards(AccessTokenGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiFindMyNotifications()
  findMy(@Req() req: IRequestWithUser) {
    return this.notificationsService.findMy(req.user.sub);
  }

  @Patch('read-all')
  @ApiMarkAllAsReadNotifications()
  markAllAsRead(@Req() req: IRequestWithUser) {
    return this.notificationsService.markAllAsRead(req.user.sub);
  }

  @Patch(':id/read')
  @ApiMarkAsReadNotification()
  markAsRead(@Param('id') id: string, @Req() req: IRequestWithUser) {
    return this.notificationsService.markAsRead(id, req.user.sub);
  }
}
