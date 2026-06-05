import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import {
  ClientNotification,
  NotificationPayload,
  NotificationsState,
} from '../../features/notification/notification.type';

const initialState: NotificationsState = {
  items: [],
};

const createLocalId = (): string => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<NotificationPayload>) => {
      const notification: ClientNotification = {
        localId: createLocalId(),
        viewed: false,
        payload: action.payload,
      };
      state.items.unshift(notification);
    },
    markAsViewed: (state, action: PayloadAction<string>) => {
      const notification = state.items.find(item => item.localId === action.payload);
      if (notification) {
        notification.viewed = true;
      }
    },
    markAllAsViewed: state => {
      state.items.forEach(item => {
        item.viewed = true;
      });
    },
    clearViewed: state => {
      state.items = state.items.filter(item => !item.viewed);
    },
    clearNotifications: state => {
      state.items = [];
    },
  },
});

export const { addNotification, markAsViewed, markAllAsViewed, clearViewed, clearNotifications } =
  notificationsSlice.actions;
export const notificationsReducer = notificationsSlice.reducer;
