import { Server } from 'socket.io';
import {
  ConnectedSocket,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
} from '@nestjs/websockets';

import { NotificationPayload, SocketWithUser } from './notifications.type';
import { WsJwtService } from './guards/ws-jwt.guard';

@WebSocketGateway({ cors: true, namespace: 'notifications' })
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  constructor(private readonly wsJwtService: WsJwtService) {}

  async handleConnection(@ConnectedSocket() client: SocketWithUser) {
    try {
      const payload = this.wsJwtService.validate(client);
      if (!payload || !payload.sub) {
        client.disconnect();
        return;
      }
      client.data.user = payload;
      const userId = payload.sub;

      await client.join(userId);
    } catch {
      client.disconnect();
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleDisconnect(client: SocketWithUser) {}

  notifyUser(userId: string, payload: NotificationPayload) {
    this.server.to(userId).emit('notificateNewRequest', payload);
  }
}
