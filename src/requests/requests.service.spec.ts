import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from './entities/request.entity';
import { RequestsService } from './requests.service';

describe('RequestsService', () => {
  let service: RequestsService;
  const createQueryBuilderMock = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestsService,
        {
          provide: getRepositoryToken(Request),
          useValue: {
            createQueryBuilder: jest.fn(() => createQueryBuilderMock),
          } as unknown as Partial<Repository<Request>>,
        },
      ],
    }).compile();

    service = module.get<RequestsService>(RequestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns incoming requests for current receiver', async () => {
    const incomingRequests = [{ id: 'request-1' }, { id: 'request-2' }];
    createQueryBuilderMock.getMany.mockResolvedValue(incomingRequests);

    const result = await service.findIncoming('user-1');

    expect(createQueryBuilderMock.where).toHaveBeenCalledWith(
      'receiver.id = :userId',
      { userId: 'user-1' },
    );
    expect(createQueryBuilderMock.orderBy).toHaveBeenCalledWith(
      'request.createdAt',
      'DESC',
    );
    expect(result).toBe(incomingRequests);
  });
});
