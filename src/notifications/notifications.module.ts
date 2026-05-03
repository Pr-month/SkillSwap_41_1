import { Module } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { WsJwtService } from './guards/ws-jwt.guard';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule.register({})],
  providers: [NotificationsGateway, WsJwtService],
  exports: [NotificationsGateway],
})
export class NotificationsModule {}
