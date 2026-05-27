import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationPayload } from './notifications.type';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async createForUser(
    receiverId: string,
    payload: NotificationPayload,
  ): Promise<Notification> {
    const notification = this.notificationRepository.create({
      receiverId,
      type: payload.type,
      skillName: payload.skillName,
      fromUserId: payload.fromUser.id,
      fromUserName: payload.fromUser.name,
      requestId: payload.requestId,
      message: payload.message,
    });

    const result = await this.notificationRepository.save(notification);

    return result;
  }

  async findMy(receiverId: string): Promise<Notification[]> {
    const result = await this.notificationRepository.find({
      where: { receiverId },
      order: { createdAt: 'DESC' },
    });

    return result;
  }

  async markAsRead(id: string, receiverId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { receiverId, id },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.isRead = true;

    const result = await this.notificationRepository.save(notification);

    return result;
  }
}
