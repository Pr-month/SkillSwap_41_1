import { Socket } from 'socket.io';
import { JwtPayload } from '../auth/auth.types';
export enum NotificationType {
  NEW_REQUEST = 'NEW_REQUEST', // новая заявка
  REJECTED = 'REJECTED', // отклонена
  ACCEPTED = 'ACCEPTED', // принята
}

export interface NotificationPayload {
  type: NotificationType;
  skillName: string;
  fromUser: {
    id: string;
    name: string;
  };
}

export interface SocketWithUser extends Socket {
  data: { user: JwtPayload };
}
