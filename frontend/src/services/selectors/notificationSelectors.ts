import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/services/store/store';
import type { ClientNotification } from '../../features/notification/notification.type';

const selectNotificationsState = (state: RootState) => state.notifications;

export const selectAllNotifications = createSelector(
  [selectNotificationsState],
  notifications => notifications.items,
);
export const selectNewNotifications = createSelector(
  [selectAllNotifications],
  (notifications): ClientNotification[] =>
    notifications.filter(notification => !notification.viewed),
);
export const selectViewedNotifications = createSelector(
  [selectAllNotifications],
  (notifications): ClientNotification[] =>
    notifications.filter(notification => notification.viewed),
);
export const selectUnreadNotificationsCount = createSelector(
  [selectNewNotifications],
  notifications => notifications.length,
);
export const selectHasNotifications = createSelector(
  [selectAllNotifications],
  notifications => notifications.length > 0,
);
export const selectHasUnreadNotifications = createSelector(
  [selectNewNotifications],
  notifications => notifications.length > 0,
);
