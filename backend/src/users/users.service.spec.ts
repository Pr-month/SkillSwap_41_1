import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { City } from '../cities/entities/city.entity';
import { Category } from '../categories/entities/category.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { appConfig } from '../config/app.config';

type MockUserRepository = {
  find: jest.Mock;
  findOne: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
  findOneBy: jest.Mock;
  findAndCount: jest.Mock;
};

type MockCityRepository = {
  findOne: jest.Mock;
};

const createMockRepository = (): MockUserRepository => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  findOneBy: jest.fn(),
  findAndCount: jest.fn(),
});

describe('UsersService', () => {
  let service: UsersService;
  let userRepo: MockUserRepository;
  let cityRepo: MockCityRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(City),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: getRepositoryToken(Category),
          useValue: { findBy: jest.fn() },
        },
        {
          provide: appConfig.KEY,
          useValue: { jwtSecret: 'secret' },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepo = module.get<MockUserRepository>(getRepositoryToken(User));
    cityRepo = module.get<MockCityRepository>(getRepositoryToken(City));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all users with relations', async () => {
      const users = [{ id: '1' }, { id: '2' }] as User[];

      userRepo.findAndCount.mockResolvedValue(users);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toEqual({ data: { id: '1' }, page: 1, totalPages: NaN });
      expect(userRepo.findAndCount).toHaveBeenCalledWith({
        relations: {
          skills: true,
          wantToLearn: true,
          favoriteSkills: true,
        },
        skip: 0,
        take: 10,
      });
    });
  });

  describe('findOne', () => {
    it('should return one user by id', async () => {
      const user = { id: '1' } as User;

      userRepo.findOne.mockResolvedValue(user);

      const result = await service.findOne('1');

      expect(result).toEqual(user);
      expect(userRepo.findOne).toHaveBeenCalled();
    });

    it('should return null if user not found', async () => {
      userRepo.findOne.mockResolvedValue(null);

      const result = await service.findOne('wrong-id');

      expect(result).toBeNull();
      expect(userRepo.findOne).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return user by id with relations', async () => {
      const user = { id: '1' } as User;

      userRepo.findOne.mockResolvedValue(user);

      const result = await service.findById('1');

      expect(result).toEqual(user);
      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: {
          skills: true,
          wantToLearn: true,
          favoriteSkills: true,
        },
      });
    });

    it('should return null if user not found', async () => {
      userRepo.findOne.mockResolvedValue(null);

      const result = await service.findById('wrong-id');

      expect(result).toBeNull();
    });
  });

  describe('updateMe', () => {
    it('should update current user and save it', async () => {
      const user = {
        id: '1',
        name: 'Old name',
        email: 'old@mail.com',
        password: 'hashed-password',
        about: null,
        birthdate: null,
        city: null,
        gender: null,
        avatar: null,
        skills: [],
        wantToLearn: [],
        favoriteSkills: [],
        role: 'USER',
        refreshToken: null,
      } as User;

      const mockCity = {
        id: 1,
        name: 'Almaty',
      };

      const dto = {
        name: 'Anna',
        about: 'Backend developer',
        birthdate: '1998-05-10',
        cityId: 1,
        avatar: 'avatar.png',
      } as UpdateUserDto;

      const savedUser = {
        ...user,
        ...dto,
        city: mockCity,
      } as User;

      const findByIdSpy = jest
        .spyOn(service, 'findById')
        .mockResolvedValue(user);

      cityRepo.findOne.mockResolvedValue(mockCity);
      userRepo.save.mockResolvedValue(savedUser);

      const result = await service.updateMe('1', dto);

      expect(findByIdSpy).toHaveBeenCalledWith('1');

      expect(userRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '1',
          name: 'Anna',
          email: 'old@mail.com',
          about: 'Backend developer',
          birthdate: '1998-05-10',
          city: mockCity,
          avatar: 'avatar.png',
        }),
      );

      expect(result).toEqual(savedUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      const dto = {
        name: 'Anna',
      } as UpdateUserDto;

      jest.spyOn(service, 'findById').mockResolvedValue(null);

      await expect(service.updateMe('wrong-id', dto)).rejects.toThrow(
        NotFoundException,
      );

      expect(userRepo.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if city not found', async () => {
      const user = { id: '1' } as User;
      const dto = { cityId: 999 } as UpdateUserDto;

      cityRepo.findOne.mockResolvedValue(null);
      jest.spyOn(service, 'findById').mockResolvedValue(user);

      await expect(service.updateMe('1', dto)).rejects.toThrow(
        BadRequestException,
      );

      expect(userRepo.save).not.toHaveBeenCalled();
    });
  });
});
