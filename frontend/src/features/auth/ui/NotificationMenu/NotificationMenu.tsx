import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import IdeaIcon from '@/app/assets/static/images/icons/idea.svg';
import styles from './NotificationMenu.module.css';
import { Button } from '@/shared/ui/button/button';

import type { AppDispatch } from '@/services/store/store';

import {
  markAllAsViewed,
  clearViewed,
  markAsViewed,
} from '../../../../services/slices/notificationSlice';

import {
  selectNewNotifications,
  selectViewedNotifications,
} from './../../../../services/selectors/notificationSelectors';

import { NotificationType } from '../../../../features/notification/notification.type';

export function NotificationMenu() {
  const dispatch = useDispatch<AppDispatch>();
  const newNotifications = useSelector(selectNewNotifications);
  const viewedNotifications = useSelector(selectViewedNotifications);

  const handleReadAll = (): void => {
    dispatch(markAllAsViewed());
  };

  const handleClearViewed = (): void => {
    dispatch(clearViewed());
  };

  const handleMarkAsViewed = (localId: string): void => {
    dispatch(markAsViewed(localId));
  };

  const getNotificationText = (type: NotificationType, skillName: string): string => {
    switch (type) {
      case NotificationType.NEW_REQUEST:
        return `предлагает обмен навыком "${skillName}"`;

      case NotificationType.ACCEPTED:
        return `принял обмен навыком "${skillName}"`;

      case NotificationType.REJECTED:
        return `отклонил обмен навыком "${skillName}"`;

      default:
        return '';
    }
  };

  const getLink = (type: NotificationType): string => {
    switch (type) {
      case NotificationType.NEW_REQUEST:
        return '/obmen';

      case NotificationType.ACCEPTED:
      case NotificationType.REJECTED:
        return '/profile';

      default:
        return '/';
    }
  };

  const formatDate = (timeStamp: string): string => new Date(timeStamp).toLocaleString('ru-RU');

  return (
    <div className={styles.notificationMenu} data-testid="notification-menu">
      <div className={styles.headerMenu}>
        <h3 className={styles.headerMenuTitle}>Новые уведомления</h3>

        <button onClick={handleReadAll} className={styles.readAll} data-testid="read-all-btn">
          Прочитать все
        </button>
      </div>

      <div className={styles.notificationList}>
        {newNotifications.map(notification => (
          <div
            key={notification.localId}
            className={styles.notificationItem}
            data-testid="new-notification"
          >
            <div className={styles.notificationHeader}>
              <img src={IdeaIcon} alt="Иконка" className={styles.icon} />

              <div className={styles.notificationInfo}>
                <div className={styles.userLine}>
                  <span className={styles.userName}>{notification.payload.fromUser.name}</span>

                  <span className={styles.statusText}>
                    {getNotificationText(
                      notification.payload.type,

                      notification.payload.skillName,
                    )}
                  </span>

                  <span className={styles.date}>{formatDate(notification.payload.timeStamp)}</span>
                </div>

                {notification.payload.message && (
                  <p className={styles.message}>{notification.payload.message}</p>
                )}
              </div>
            </div>

            <div className={styles.notificationActions}>
              <Link
                to={getLink(notification.payload.type)}
                className={styles.buttonNotificationMenu}
                data-testid="notification-link"
                onClick={() => handleMarkAsViewed(notification.localId)}
              >
                <Button type="primary">Перейти</Button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {viewedNotifications.length > 0 && (
        <div className={styles.viewedSection} data-testid="viewed-section">
          <div className={styles.viewedHeader}>
            <h3 className={styles.viewedHeaderTitle}>Просмотренные</h3>

            <button
              className={styles.clearButton}
              onClick={handleClearViewed}
              data-testid="clear-btn"
            >
              Очистить
            </button>
          </div>

          {viewedNotifications.map(notification => (
            <div
              key={notification.localId}
              className={styles.notificationItem}
              data-testid="viewed-notification"
            >
              <div className={styles.notificationView}>
                <img src={IdeaIcon} alt="Иконка" className={styles.icon} />

                <div className={styles.notificationInfo}>
                  <div className={styles.userLine}>
                    <span className={styles.userName}>{notification.payload.fromUser.name}</span>

                    <span className={styles.statusText}>
                      {getNotificationText(
                        notification.payload.type,

                        notification.payload.skillName,
                      )}
                    </span>

                    <span className={styles.date}>
                      {formatDate(notification.payload.timeStamp)}
                    </span>
                  </div>

                  {notification.payload.message && (
                    <p className={styles.message}>{notification.payload.message}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
