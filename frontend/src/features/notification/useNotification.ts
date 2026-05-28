import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../services/store/store';
import { addNotification } from '../../services/slices/notificationSlice';
import { NotificationPayload } from './notification.type';
import { notificationsSocket } from './notification.socket';

export const useNotificationsSocket = (): void => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const socket = notificationsSocket.connect();
    const handleNotification = (payload: NotificationPayload): void => {
      dispatch(addNotification(payload));
    };
    socket.on('notificateNewRequest', handleNotification);
    return () => {
      socket.off('notificateNewRequest', handleNotification);
    };
  }, [dispatch, notificationsSocket]);
};
