import { Test, TestingModule } from '@nestjs/testing';
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';

describe('RequestsController', () => {
  let controller: RequestsController;
  const requestsServiceMock = {
    findIncoming: jest.fn(),
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
});
