import { Module } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { WsJwtService } from './guards/ws-jwt.guard';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';

@Module({
  imports: [JwtModule.register({}), TypeOrmModule.forFeature([Notification])],
  controllers: [NotificationsController],
  providers: [NotificationsGateway, WsJwtService, NotificationsService],
  exports: [NotificationsGateway, NotificationsService],
})
export class NotificationsModule {}
