import {
  Controller,
  Patch,
  Param,
  UseGuards,
  Req,
  Get,
} from '@nestjs/common';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { NotificationsService } from './notifications.service';
import { IRequestWithUser } from 'src/auth/auth.types';

@Controller('notifications')
@UseGuards(AccessTokenGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findMy(@Req() req: IRequestWithUser) {
    return this.notificationsService.findMy(req.user.sub)
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @Req() req: IRequestWithUser) {
    return this.notificationsService.markAsRead(id, req.user.sub)
  }
}
