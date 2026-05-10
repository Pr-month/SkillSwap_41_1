import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  const usersServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    updateMe: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates users pagination to the service', async () => {
    usersServiceMock.findAll.mockResolvedValue({
      data: [{ id: '1' }],
      page: 1,
      totalPages: 1,
    });

    const result = await controller.findAll({ page: 1, limit: 20 });

    expect(usersServiceMock.findAll).toHaveBeenCalledWith({ page: 1, limit: 20 });
    expect(result).toEqual({
      data: [{ id: '1' }],
      page: 1,
      totalPages: 1,
    });
  });
});
