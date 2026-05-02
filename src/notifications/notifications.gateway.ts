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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      client.disconnect();
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleDisconnect(client: SocketWithUser) {}

  notifyUser(userId: string, payload: NotificationPayload) {
    this.server.to(userId).emit('notificateNewRequest', payload);
  }
}
