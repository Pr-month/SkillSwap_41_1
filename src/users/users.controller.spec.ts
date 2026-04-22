import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  const usersService = {
    updatePassword: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    updateMe: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: usersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should delegate password update to the service', async () => {
    usersService.updatePassword.mockResolvedValueOnce({
      message: 'Password updated successfully',
    });

    const result = await controller.updatePassword(
      { sub: 'user-id' },
      {
        oldPassword: 'old-password',
        newPassword: 'new-password',
      },
    );

    expect(usersService.updatePassword).toHaveBeenCalledWith('user-id', {
      oldPassword: 'old-password',
      newPassword: 'new-password',
    });
    expect(result).toEqual({ message: 'Password updated successfully' });
  });
});
