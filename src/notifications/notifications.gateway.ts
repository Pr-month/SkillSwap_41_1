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

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
@WebSocketGateway({ cors: true, namespace: 'notifications' })
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @WebSocketServer()
  server!: Server;

  constructor(private readonly wsJwtService: WsJwtService) {}

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  async handleConnection(@ConnectedSocket() client: SocketWithUser) {
    try {
      const payload = this.wsJwtService.validate(client);
      if (!payload || !payload.sub) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        client.disconnect();
        return;
      }
      client.data.user = payload;
      const userId = payload.sub;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      await client.join(userId);
    } catch {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      client.disconnect();
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleDisconnect(client: SocketWithUser) {}

  notifyUser(userId: string, payload: NotificationPayload) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    this.server.to(userId).emit('notificateNewRequest', payload);
  }
}
