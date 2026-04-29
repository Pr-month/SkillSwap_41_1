import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Category } from '../categories/entities/category.entity';
import { Skill } from '../skills/entities/skill.entity';
import { appConfig } from '../config/app.config';
import { jwtConfig } from '../config/jwt.config';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  const userRepositoryMock = {
    create: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
  };
  const categoryRepositoryMock = {
    findOne: jest.fn(),
  };
  const skillRepositoryMock = {
    create: jest.fn(),
  };
  const jwtServiceMock = {
    sign: jest.fn(),
    verifyAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepositoryMock as unknown as Partial<Repository<User>>,
        },
        {
          provide: getRepositoryToken(Category),
          useValue: categoryRepositoryMock as unknown as Partial<
            Repository<Category>
          >,
        },
        {
          provide: getRepositoryToken(Skill),
          useValue: skillRepositoryMock as unknown as Partial<
            Repository<Skill>
          >,
        },
        {
          provide: appConfig.KEY,
          useValue: { hashSalt: 10 },
        },
        {
          provide: jwtConfig.KEY,
          useValue: {
            accessSecret: 'access-secret',
            refreshSecret: 'refresh-secret',
            accessExpiresIn: '1h',
            refreshExpiresIn: '7d',
          },
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
