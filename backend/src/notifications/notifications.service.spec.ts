import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { Notification } from './entities/notification.entity';
import { NotificationsService } from './notifications.service';
import { NotificationPayload, NotificationType } from './notifications.type';

describe('NotificationsService', () => {
  let service: NotificationsService;
  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getRepositoryToken(Notification),
          useValue: mockRepository as unknown as Partial<
            Repository<Notification>
          >,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createForUser', () => {
    const receiverId = 'receiver-id';
    const payload = {
      type: NotificationType.NEW_REQUEST,
      skillName: 'React',
      fromUser: { id: 'sender-id', name: 'Sender' },
      requestId: 'req-1',
      timeStamp: new Date(),
    } as NotificationPayload;
    const savedNotification = {
      id: 'n1',
      receiverId,
      type: NotificationType.NEW_REQUEST,
      skillName: 'React',
      fromUserId: 'sender-id',
      fromUserName: 'Sender',
      requestId: 'req-1',
      isRead: false,
    };

    it('Сервис должен создать уведомление', async () => {
      mockRepository.create.mockReturnValue(savedNotification);
      mockRepository.save.mockResolvedValue(savedNotification);

      const result = await service.createForUser(receiverId, payload);

      expect(mockRepository.create).toHaveBeenCalledWith({
        receiverId,
        type: payload.type,
        skillName: payload.skillName,
        fromUserId: payload.fromUser.id,
        fromUserName: payload.fromUser.name,
        requestId: payload.requestId,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(savedNotification);
      expect(result).toEqual(savedNotification);
    });
  });

  describe('findMy', () => {
    it('Сервис должен вернуть уведомления пользователя', async () => {
      const notifications = [{ id: 'n1', receiverId: 'user-1' }];
      mockRepository.find.mockResolvedValue(notifications);

      const result = await service.findMy('user-1');

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { receiverId: 'user-1' },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(notifications);
    });
  });

  describe('markAsRead', () => {
    const notification = {
      id: 'n1',
      receiverId: 'user-1',
      isRead: false,
    };

    it('Сервис должен отметить уведомление прочитанным', async () => {
      mockRepository.findOne.mockResolvedValue(notification);
      mockRepository.save.mockResolvedValue({ ...notification, isRead: true });

      const result = await service.markAsRead('n1', 'user-1');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { receiverId: 'user-1', id: 'n1' },
      });
      expect(result.isRead).toBe(true);
    });

    it('Сервис должен выдать NotFoundException если уведомление не найдено', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.markAsRead('n1', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
