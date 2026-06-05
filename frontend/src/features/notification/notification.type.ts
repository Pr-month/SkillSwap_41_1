export enum NotificationType {
  NEW_REQUEST = 'NEW_REQUEST',
  REJECTED = 'REJECTED',
  ACCEPTED = 'ACCEPTED',
}

export interface NotificationPayload {
  type: NotificationType;

  // название навыка
  skillName: string;

  // отправитель
  fromUser: {
    id: string;
    name: string;
  };
  requestId?: string;
  message?: string;
  timeStamp: string;
}

export interface ClientNotification {
  localId: string;
  viewed: boolean;
  payload: NotificationPayload;
}

export interface NotificationsState {
  items: ClientNotification[];
}
