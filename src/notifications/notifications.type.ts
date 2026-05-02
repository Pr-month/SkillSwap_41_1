import { Socket } from 'socket.io';
import { JwtPayload } from '../auth/auth.types';
export enum NotificationType {
  NEW_REQUEST = 'NEW_REQUEST', // новая заявка
  REJECTED = 'REJECTED', // отклонена
  ACCEPTED = 'ACCEPTED', // принята
}

export interface NotificationPayload {
  type: NotificationType;
  skillName: string; // название навыка
  fromUser: {
    id: string; // id отправителя
    name: string; // имя отправителя
  };
  requestId?: string; // id заявки, если нужно
  message?: string; // сообщение в нотификацию, если нужно
  timeStamp: Date; // время создания
}

export interface SocketWithUser extends Socket {
  data: { user: JwtPayload };
}
