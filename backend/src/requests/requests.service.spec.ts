import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { Skill } from '../skills/entities/skill.entity';
import { User } from '../users/entities/user.entity';
import { Request } from './entities/request.entity';
import { RequestsService } from './requests.service';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { UserRole } from '../users/entities/enums/users.enums';
import { RequestStatus } from './entities/request.enum';
import { NotificationType } from '../notifications/notifications.type';
import { IRequestWithUser } from '../auth/auth.types';
import { MailService } from '../mail/mail.service';

describe('RequestsService', () => {
  let service: RequestsService;

  const mockRequestsRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneOrFail: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockUsersRepository = {
    findOne: jest.fn(),
  };

  const mockSkillsRepository = {
    findOne: jest.fn(),
  };

  const mockNotificationsGateway = {
    notifyUser: jest.fn(),
  };

  const mockNotificationsService = {
    createForUser: jest.fn(),
  };

  const mockMailService = {
    sendNotification: jest.fn()
  }

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestsService,
        {
          provide: getRepositoryToken(Request),
          useValue: mockRequestsRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUsersRepository,
        },
        {
          provide: getRepositoryToken(Skill),
          useValue: mockSkillsRepository,
        },
        {
          provide: NotificationsGateway,
          useValue: mockNotificationsGateway,
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
        { provide: MailService,
          useValue: mockMailService
        }
      ],
    }).compile();

    service = module.get<RequestsService>(RequestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const senderId = 'sender-id';
    const dto = { offeredSkillId: 'skill-1', requestedSkillId: 'skill-2' };

    const sender = { id: senderId, name: 'Sender Name' } as User;
    const receiver = { id: 'receiver-id', name: 'Receiver Name' } as User;
    const offeredSkill = { id: 'skill-1', owner: sender } as Skill;
    const requestedSkill = {
      id: 'skill-2',
      title: 'NestJS',
      owner: receiver,
    } as Skill;

    it('should successfully create a request and send notification', async () => {
      mockUsersRepository.findOne.mockResolvedValue(sender);
      mockSkillsRepository.findOne
        .mockResolvedValueOnce(offeredSkill)
        .mockResolvedValueOnce(requestedSkill);

      const newRequest = {
        id: 'req-1',
        sender,
        receiver,
        offeredSkill,
        requestedSkill,
      };
      mockRequestsRepository.create.mockReturnValue(newRequest);
      mockRequestsRepository.save.mockResolvedValue(newRequest);
      mockRequestsRepository.findOneOrFail.mockResolvedValue(newRequest);

      const result = await service.create(dto, senderId);

      expect(mockRequestsRepository.save).toHaveBeenCalled();
      expect(mockNotificationsGateway.notifyUser).toHaveBeenCalledWith(
        receiver.id,
        expect.objectContaining({
          type: NotificationType.NEW_REQUEST,
          skillName: 'NestJS',
        }),
      );
      expect(mockNotificationsService.createForUser).toHaveBeenCalledWith(
        receiver.id,
        expect.objectContaining({ type: NotificationType.NEW_REQUEST }),
      );
      expect(mockMailService.sendNotification).toHaveBeenCalled();
      expect(result).toEqual(newRequest);
    });

    it('should throw NotFoundException if data is missing', async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);
      await expect(service.create(dto, senderId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if sender equals receiver', async () => {
      const ownSkill = {
        id: 'skill-2',
        title: 'NestJS',
        owner: sender,
      } as Skill;
      mockUsersRepository.findOne.mockResolvedValue(sender);
      mockSkillsRepository.findOne
        .mockResolvedValueOnce(offeredSkill)
        .mockResolvedValueOnce(ownSkill);

      await expect(service.create(dto, senderId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ForbiddenException if offered skill does not belong to sender', async () => {
      const notOwnedSkill = { id: 'skill-1', owner: receiver } as Skill;
      mockUsersRepository.findOne.mockResolvedValue(sender);
      mockSkillsRepository.findOne
        .mockResolvedValueOnce(notOwnedSkill)
        .mockResolvedValueOnce(requestedSkill);

      await expect(service.create(dto, senderId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('update', () => {
    const reqObj = { user: { sub: 'receiver-id' } } as IRequestWithUser;
    const updateDto = { status: RequestStatus.ACCEPTED };

    const existingRequest = {
      id: 'req-1',
      receiver: { id: 'receiver-id', name: 'Receiver' },
      sender: { id: 'sender-id' },
      requestedSkill: { title: 'NestJS' },
      status: RequestStatus.PENDING,
    };

    it('should update status and send ACCEPTED notification', async () => {
      mockRequestsRepository.findOne.mockResolvedValue(existingRequest);
      mockRequestsRepository.save.mockResolvedValue({
        ...existingRequest,
        status: RequestStatus.ACCEPTED,
      });

      const result = await service.update('req-1', updateDto, reqObj);

      expect(mockRequestsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: RequestStatus.ACCEPTED }),
      );
      expect(mockNotificationsGateway.notifyUser).toHaveBeenCalledWith(
        'sender-id',
        expect.objectContaining({
          type: NotificationType.ACCEPTED,
          skillName: 'NestJS',
        }),
      );
      expect(mockNotificationsService.createForUser).toHaveBeenCalledWith(
        'sender-id',
        expect.objectContaining({ type: NotificationType.ACCEPTED }),
      );
      expect(mockMailService.sendNotification).toHaveBeenCalled();
      expect(result.status).toBe(RequestStatus.ACCEPTED);
    });

    it('should throw NotFoundException if request not found', async () => {
      mockRequestsRepository.findOne.mockResolvedValue(null);
      await expect(service.update('req-1', updateDto, reqObj)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user is not the receiver', async () => {
      const hackerReq = { user: { sub: 'hacker-id' } } as IRequestWithUser;
      mockRequestsRepository.findOne.mockResolvedValue(existingRequest);
      await expect(
        service.update('req-1', updateDto, hackerReq),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findIncoming', () => {
    it('should return incoming requests for user', async () => {
      mockRequestsRepository.find.mockResolvedValue([{ id: 'req-1' }]);
      const result = await service.findIncoming('user-1');
      expect(mockRequestsRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { receiver: { id: 'user-1' } },
        }),
      );
      expect(result).toEqual([{ id: 'req-1' }]);
    });
  });

  describe('findOutgoing', () => {
    it('should return outgoing requests for user', async () => {
      mockRequestsRepository.find.mockResolvedValue([{ id: 'req-1' }]);
      const result = await service.findOutgoing('user-1');
      expect(mockRequestsRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { sender: { id: 'user-1' } },
        }),
      );
      expect(result).toEqual([{ id: 'req-1' }]);
    });
  });

  describe('remove', () => {
    const existingRequest = {
      id: 'req-1',
      sender: { id: 'sender-id' },
    };

    it('should successfully remove request if user is sender', async () => {
      const reqObj = {
        user: { sub: 'sender-id', role: UserRole.USER },
      } as IRequestWithUser;
      mockRequestsRepository.findOne.mockResolvedValue(existingRequest);

      await service.remove('req-1', reqObj);
      expect(mockRequestsRepository.remove).toHaveBeenCalledWith(
        existingRequest,
      );
    });

    it('should successfully remove request if user is ADMIN', async () => {
      const reqObj = {
        user: { sub: 'admin-id', role: UserRole.ADMIN },
      } as IRequestWithUser;
      mockRequestsRepository.findOne.mockResolvedValue(existingRequest);

      await service.remove('req-1', reqObj);
      expect(mockRequestsRepository.remove).toHaveBeenCalledWith(
        existingRequest,
      );
    });

    it('should throw NotFoundException if request does not exist', async () => {
      const reqObj = { user: { sub: 'sender-id' } } as IRequestWithUser;
      mockRequestsRepository.findOne.mockResolvedValue(null);
      await expect(service.remove('req-1', reqObj)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user is neither sender nor ADMIN', async () => {
      const reqObj = {
        user: { sub: 'hacker-id', role: UserRole.USER },
      } as IRequestWithUser;
      mockRequestsRepository.findOne.mockResolvedValue(existingRequest);
      await expect(service.remove('req-1', reqObj)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
