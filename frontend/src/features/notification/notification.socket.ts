import { io, Socket } from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_SKILLSWAP_API_URL || '';

class NotificationsSocket {
  private socket: Socket | null = null;

  connect(): Socket {
    if (this.socket) {
      return this.socket;
    }

    this.socket = io(`${API_BASE_URL}/notifications`, {
      withCredentials: true,
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.socket.on('connect', () => {
      console.log('[notifications] connected');
    });

    this.socket.on('disconnect', reason => {
      console.log('[notifications] disconnected', reason);
    });

    this.socket.on('reconnect', attempt => {
      console.log(`[notifications] reconnected after ${attempt} attempts`);
    });

    this.socket.on('connect_error', error => {
      console.error('[notifications] error', error.message);
    });

    return this.socket;
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  disconnect(): void {
    this.socket?.disconnect();

    this.socket = null;
  }
}

export const notificationsSocket = new NotificationsSocket();
