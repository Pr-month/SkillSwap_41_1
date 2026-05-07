import { Test, TestingModule } from '@nestjs/testing';
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';

describe('RequestsController', () => {
  let controller: RequestsController;
  const requestsServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    findIncoming: jest.fn(),
    findOutgoing: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RequestsController],
      providers: [
        {
          provide: RequestsService,
          useValue: requestsServiceMock,
        },
      ],
    }).compile();

    controller = module.get<RequestsController>(RequestsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates incoming requests lookup to the service', async () => {
    const incomingRequests = [{ id: 'request-1' }];
    requestsServiceMock.findIncoming.mockResolvedValue(incomingRequests);

    const result = await controller.getIncoming({
      user: { sub: 'user-1' },
    } as never);

    expect(requestsServiceMock.findIncoming).toHaveBeenCalledWith('user-1');
    expect(result).toBe(incomingRequests);
  });

  it('delegates outgoing requests retrieval to the service', async () => {
    requestsServiceMock.findOutgoing.mockResolvedValue([{ id: 'request-1' }]);

    const result = await controller.getOutgoing({
      user: { sub: 'user-1' },
    } as never);

    expect(requestsServiceMock.findOutgoing).toHaveBeenCalledWith('user-1');
    expect(result).toEqual([{ id: 'request-1' }]);
  });
});
