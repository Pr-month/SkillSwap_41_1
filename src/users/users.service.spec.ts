import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { UsersRepository } from '../repository/users.repository';
import { appConfig } from '../config/app.config';

describe('UsersService', () => {
  let service: UsersService;
  const usersRepository = {
    findById: jest.fn(),
    updatePassword: jest.fn(),
    updateMe: jest.fn(),
  };

  const configService = {
    hashSalt: 10,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: usersRepository,
        },
        {
          provide: appConfig.KEY,
          useValue: configService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should update password when old password is valid', async () => {
    const user = {
      id: 'user-id',
      password: 'old-hash',
    };

    usersRepository.findById.mockResolvedValueOnce(user);
    usersRepository.updatePassword.mockResolvedValueOnce({
      ...user,
      password: 'new-hash',
    });
    jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true as never);
    jest.spyOn(bcrypt, 'hash').mockResolvedValueOnce('new-hash' as never);

    const result = await service.updatePassword('user-id', {
      oldPassword: 'old-password',
      newPassword: 'new-password',
    });

    expect(usersRepository.findById).toHaveBeenCalledWith('user-id');
    expect(bcrypt.compare).toHaveBeenCalledWith('old-password', 'old-hash');
    expect(bcrypt.hash).toHaveBeenCalledWith('new-password', 10);
    expect(usersRepository.updatePassword).toHaveBeenCalledWith(
      'user-id',
      'new-hash',
    );
    expect(result).toEqual({ message: 'Password updated successfully' });
  });

  it('should throw NotFoundException when user is missing', async () => {
    usersRepository.findById.mockResolvedValueOnce(null);

    await expect(
      service.updatePassword('missing-user', {
        oldPassword: 'old-password',
        newPassword: 'new-password',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(usersRepository.updatePassword).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException when old password is invalid', async () => {
    usersRepository.findById.mockResolvedValueOnce({
      id: 'user-id',
      password: 'old-hash',
    });
    jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(false as never);

    await expect(
      service.updatePassword('user-id', {
        oldPassword: 'wrong-old-password',
        newPassword: 'new-password',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(usersRepository.updatePassword).not.toHaveBeenCalled();
  });
});
