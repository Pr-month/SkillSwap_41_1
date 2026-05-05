import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from './entities/request.entity';
import { RequestsService } from './requests.service';

describe('RequestsService', () => {
  let service: RequestsService;
  const requestsRepositoryMock = {
    createQueryBuilder: jest.fn(),
  };
  const queryBuilderMock = {
    leftJoin: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
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
      ],
    }).compile();

    service = module.get<RequestsService>(RequestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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
