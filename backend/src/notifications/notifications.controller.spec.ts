import { IRequestWithUser } from './../auth/auth.types';
import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  const notificationsServiceMock = {
    findMy: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsService,
          useValue: notificationsServiceMock,
        },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findMy ', async () => {
    notificationsServiceMock.findMy.mockResolvedValue([{ id: 'n1' }]);

    const result = await controller.findMy({
      user: { sub: 'user-1' },
    } as IRequestWithUser);

    expect(notificationsServiceMock.findMy).toHaveBeenCalledWith('user-1');
    expect(result).toEqual([{ id: 'n1' }]);
  });

  it('markAsRead', async () => {
    notificationsServiceMock.markAsRead.mockResolvedValue({
      id: 'n1',
      isRead: true,
    });

    const result = await controller.markAsRead('id', {
      user: { sub: 'user-1' },
    } as IRequestWithUser);

    expect(notificationsServiceMock.markAsRead).toHaveBeenCalledWith(
      'id',
      'user-1',
    );
    expect(result).toEqual({ id: 'n1', isRead: true });
  });

  it('markAllAsRead', async () => {
    notificationsServiceMock.markAllAsRead.mockResolvedValue([]);

    const result = await controller.markAllAsRead({
      user: { sub: 'user-1' },
    } as IRequestWithUser);

    expect(notificationsServiceMock.markAllAsRead).toHaveBeenCalledWith(
      'user-1',
    );
    expect(result).toEqual([]);
  });
});
