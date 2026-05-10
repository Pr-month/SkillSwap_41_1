import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  const userRepositoryMock = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepositoryMock as unknown as Partial<Repository<User>>,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns paginated users with relations', async () => {
    userRepositoryMock.findAndCount.mockResolvedValue([[{ id: '1' }], 1]);

    const result = await service.findAll({ page: 1, limit: 20 });

    expect(userRepositoryMock.findAndCount).toHaveBeenCalledWith({
      skip: 0,
      take: 20,
      relations: {
        skills: true,
        wantToLearn: true,
        favoriteSkills: true,
      },
    });
    expect(result).toEqual({ data: [{ id: '1' }], page: 1, totalPages: 1 });
  });

  it('throws when page is out of range', async () => {
    userRepositoryMock.findAndCount.mockResolvedValue([[], 1]);

    await expect(service.findAll({ page: 2, limit: 20 })).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
