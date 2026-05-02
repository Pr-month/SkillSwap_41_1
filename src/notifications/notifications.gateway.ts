import { Server } from 'socket.io';
import {
  ConnectedSocket,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
} from '@nestjs/websockets';

import { NotificationPayload, SocketWithUser } from './notifications.type';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from './ws-jwt.guard';

@WebSocketGateway({ cors: true, namespace: 'notifications' })
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  @UseGuards(WsJwtGuard)
  async handleConnection(@ConnectedSocket() client: SocketWithUser) {
    try {
      const userId = client.data.user.sub;
      if (!userId) {
        client.disconnect();
        return;
      }
      await client.join(userId);
    } catch (error) {
      client.disconnect();
    }
  }
  handleDisconnect(_client: SocketWithUser) {}

  notifyUser(userId: string, payload: NotificationPayload) {
    this.server.to(userId).emit('notifyNewRequest', payload);
  }
}
