import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { Skill } from '../skills/entities/skill.entity';
import { User } from '../users/entities/user.entity';
import { Request } from './entities/request.entity';
import { RequestsService } from './requests.service';

describe('RequestsService', () => {
  let service: RequestsService;
  const requestsRepositoryMock = {
    find: jest.fn(),
    findOneBy: jest.fn(),
    remove: jest.fn(),
  };
  const usersRepositoryMock = {};
  const skillsRepositoryMock = {};
  const notificationsGatewayMock = {
    notifyUser: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestsService,
        {
          provide: getRepositoryToken(Request),
          useValue: requestsRepositoryMock as unknown as Partial<
            Repository<Request>
          >,
        },
        {
          provide: getRepositoryToken(User),
          useValue: usersRepositoryMock as unknown as Partial<Repository<User>>,
        },
        {
          provide: getRepositoryToken(Skill),
          useValue: skillsRepositoryMock as unknown as Partial<
            Repository<Skill>
          >,
        },
        {
          provide: NotificationsGateway,
          useValue: notificationsGatewayMock,
        },
      ],
    }).compile();

    service = module.get<RequestsService>(RequestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns outgoing requests for the current user ordered by creation date', async () => {
    requestsRepositoryMock.find.mockResolvedValue([{ id: 'request-1' }]);

    const result = await service.findOutgoing('user-1');

    expect(requestsRepositoryMock.find).toHaveBeenCalledWith({
      where: { sender: { id: 'user-1' } },
      relations: {
        sender: true,
        receiver: true,
        offeredSkill: { category: true },
        requestedSkill: { category: true },
      },
      order: { createdAt: 'DESC' },
    });
    expect(result).toEqual([{ id: 'request-1' }]);
  });
});
