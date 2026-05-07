import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Skill } from '../skills/entities/skill.entity';
import { User } from '../users/entities/user.entity';
import { Request } from './entities/request.entity';
import { RequestsService } from './requests.service';

describe('RequestsService', () => {
  let service: RequestsService;
  const requestsRepositoryMock = {
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
    findOneBy: jest.fn(),
    remove: jest.fn(),
  };
  const usersRepositoryMock = {
    findOne: jest.fn(),
  };
  const skillsRepositoryMock = {
    findOne: jest.fn(),
  };
  const queryBuilderMock = {
    leftJoin: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    getOneOrFail: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    requestsRepositoryMock.createQueryBuilder.mockReturnValue(queryBuilderMock);

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
      ],
    }).compile();

    service = module.get<RequestsService>(RequestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a request with pending status and returns the hydrated entity', async () => {
    usersRepositoryMock.findOne
      .mockResolvedValueOnce({ id: 'sender-1' })
      .mockResolvedValueOnce({ id: 'receiver-1' });
    skillsRepositoryMock.findOne
      .mockResolvedValueOnce({
        id: 'skill-1',
        owner: { id: 'sender-1' },
        category: { id: 'category-1' },
      })
      .mockResolvedValueOnce({
        id: 'skill-2',
        owner: { id: 'receiver-1' },
        category: { id: 'category-2' },
      });
    requestsRepositoryMock.create.mockReturnValue({ id: 'request-1' });
    requestsRepositoryMock.save.mockResolvedValue({ id: 'request-1' });
    queryBuilderMock.getOneOrFail.mockResolvedValue({ id: 'request-1' });

    const result = await service.create(
      {
        receiverId: 'receiver-1',
        offeredSkillId: 'skill-1',
        requestedSkillId: 'skill-2',
      },
      'sender-1',
    );

    expect(usersRepositoryMock.findOne).toHaveBeenCalledTimes(2);
    expect(skillsRepositoryMock.findOne).toHaveBeenCalledTimes(2);
    expect(requestsRepositoryMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'pending',
        isRead: false,
      }),
    );
    expect(result).toEqual({ id: 'request-1' });
  });

  it('returns outgoing requests for the current user ordered by creation date', async () => {
    queryBuilderMock.getMany.mockResolvedValue([{ id: 'request-1' }]);

    const result = await service.findOutgoing('user-1');

    expect(requestsRepositoryMock.createQueryBuilder).toHaveBeenCalledWith(
      'request',
    );
    expect(queryBuilderMock.where).toHaveBeenCalledWith('sender.id = :userId', {
      userId: 'user-1',
    });
    expect(queryBuilderMock.orderBy).toHaveBeenCalledWith(
      'request.createdAt',
      'DESC',
    );
    expect(result).toEqual([{ id: 'request-1' }]);
  });
});
