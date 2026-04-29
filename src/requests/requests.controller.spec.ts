import { Test, TestingModule } from '@nestjs/testing';
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';

describe('RequestsController', () => {
  let controller: RequestsController;
  const requestsServiceMock = {
    create: jest.fn(),
  };

  beforeEach(async () => {
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

  it('delegates request creation to the service', async () => {
    requestsServiceMock.create.mockResolvedValue({ id: 'request-1' });

    const result = await controller.create(
      {
        receiverId: 'receiver-1',
        offeredSkillId: 'skill-1',
        requestedSkillId: 'skill-2',
      },
      { user: { sub: 'sender-1' } } as never,
    );

    expect(requestsServiceMock.create).toHaveBeenCalledWith(
      {
        receiverId: 'receiver-1',
        offeredSkillId: 'skill-1',
        requestedSkillId: 'skill-2',
      },
      'sender-1',
    );
    expect(result).toEqual({ id: 'request-1' });
  });
});
