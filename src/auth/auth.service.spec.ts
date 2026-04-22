import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';
import { Category } from '../categories/entities/category.entity';
import { Skill } from '../skills/entities/skill.entity';
import { appConfig } from '../config/app.config';
import { jwtConfig } from '../config/jwt.config';

describe('AuthService', () => {
  let service: AuthService;
  const userRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };
  const categoryRepository = {
    findOne: jest.fn(),
  };
  const skillRepository = {
    create: jest.fn(),
  };
  const jwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
        {
          provide: getRepositoryToken(Category),
          useValue: categoryRepository,
        },
        {
          provide: getRepositoryToken(Skill),
          useValue: skillRepository,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
        {
          provide: appConfig.KEY,
          useValue: { hashSalt: 10 },
        },
        {
          provide: jwtConfig.KEY,
          useValue: {
            accessSecret: 'access-secret-key',
            refreshSecret: 'refresh-secret-key',
            accessExpiresIn: '1h',
            refreshExpiresIn: '7d',
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
