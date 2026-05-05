import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../users/entities/enums/users.enums';
import { appConfig } from '../config/app.config';
import { jwtConfig } from '../config/jwt.config';
import { Category } from '../categories/entities/category.entity';
import { RegisterDto } from './dto/register.dto';
import { Response } from 'express';
import { Skill } from '../skills/entities/skill.entity';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: jest.Mocked<Repository<User>>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser = {
    id: '1',
    email: 'test@mail.com',
    password: 'hashed',
    role: UserRole.USER,
    refreshToken: null,
  } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Category),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Skill),
          useValue: {},
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: appConfig.KEY,
          useValue: {
            hashSalt: 10,
          },
        },
        {
          provide: jwtConfig.KEY,
          useValue: {
            accessSecret: 'access',
            refreshSecret: 'refresh',
            accessExpiresIn: '1h',
            refreshExpiresIn: '7d',
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get(getRepositoryToken(User));
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ================= REGISTER =================
  it('should register user', async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
    userRepository.create.mockReturnValue(mockUser);
    userRepository.save.mockResolvedValue(mockUser);

    jwtService.sign.mockReturnValue('token');

    const spyCreate = jest.spyOn(userRepository, 'create');
    const spySave = jest.spyOn(userRepository, 'save');

    const result = await service.register({
      email: 'test@mail.com',
      password: '123456',
      name: 'Test',
    } as RegisterDto);

    expect(bcrypt.hash).toHaveBeenCalled();
    expect(spyCreate).toHaveBeenCalled();
    expect(spySave).toHaveBeenCalledTimes(2);
    expect(result.tokens).toBeDefined();
  });

  // ================= LOGIN =================
  it('should login successfully', async () => {
    userRepository.findOne.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    jwtService.sign.mockReturnValue('token');

    const result = await service.login({
      email: 'test@mail.com',
      password: '123456',
    });

    expect(result.user).toEqual(mockUser);
    expect(result.tokens).toBeDefined();
  });

  it('should throw if user not found', async () => {
    userRepository.findOne.mockResolvedValue(null);

    await expect(service.login({ email: 'x', password: 'x' })).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw if password invalid', async () => {
    userRepository.findOne.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(service.login({ email: 'x', password: 'x' })).rejects.toThrow(
      UnauthorizedException,
    );
  });

  // ================= REFRESH =================
  it('should refresh tokens successfully', async () => {
    const spyFindOne = jest.spyOn(userRepository, 'findOne');
    const spySign = jest.spyOn(jwtService, 'sign');

    mockUser.refreshToken = 'oldToken';
    userRepository.findOne.mockResolvedValue(mockUser);

    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (bcrypt.hash as jest.Mock).mockResolvedValue('oldToken');

    jwtService.sign.mockReturnValue('newToken');

    const result = await service.refresh(mockUser.id, 'oldToken');

    expect(spyFindOne).toHaveBeenCalledWith({
      where: { id: mockUser.id },
    });

    expect(bcrypt.compare as jest.Mock).toHaveBeenCalledWith(
      'oldToken',
      mockUser.refreshToken,
    );

    expect(spySign).toHaveBeenCalledTimes(2);

    expect(bcrypt.hash as jest.Mock).toHaveBeenCalledWith(
      'newToken',
      10, // hashSalt из mock config
    );

    expect(result.tokens).toBeDefined();
  });

  // ================= NEGATIVE CASES =================

  it('should throw if user not found', async () => {
    userRepository.findOne.mockResolvedValue(null);

    await expect(service.refresh(mockUser.id, 'oldToken')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw if no refreshToken in DB', async () => {
    userRepository.findOne.mockResolvedValue({
      ...mockUser,
      refreshToken: null,
    });

    await expect(service.refresh(mockUser.id, 'oldToken')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw if bcrypt.compare returns false', async () => {
    userRepository.findOne.mockResolvedValue(mockUser);

    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(service.refresh(mockUser.id, 'oldToken')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw if bcrypt.compare throws', async () => {
    userRepository.findOne.mockResolvedValue(mockUser);

    (bcrypt.compare as jest.Mock).mockRejectedValue(new Error());

    await expect(service.refresh(mockUser.id, 'oldToken')).rejects.toThrow();
  });

  // ================= COOKIES =================
  it('should set cookies', () => {
    const res: Response = {
      cookie: jest.fn(),
    } as unknown as Response;

    const spyCookie = jest.spyOn(res, 'cookie');

    service.setAuthCookies(res, {
      accessToken: 'a',
      refreshToken: 'r',
    });

    expect(spyCookie).toHaveBeenCalledTimes(2);
  });
});
