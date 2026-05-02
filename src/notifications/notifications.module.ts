import { Module } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { WsJwtGuard } from './ws-jwt.guard';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule.register({})],
  providers: [NotificationsGateway, WsJwtGuard],
  exports: [NotificationsGateway],
})
export class NotificationsModule {}
