import { useNotificationsSocket } from "./useNotification";

export function NotificationListener() {
    useNotificationsSocket();
    return null;
}