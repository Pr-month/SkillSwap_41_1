import {
  CanActivate,
  ExecutionContext,
  INestApplication,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AccessTokenGuard } from '../src/auth/guards/access-token.guard';
import { IRequestWithUser } from '../src/auth/auth.types';
import { SkillsController } from '../src/skills/skills.controller';
import { SkillsService } from '../src/skills/skills.service';
import { UserRole } from '../src/users/entities/enums/users.enums';

describe('SkillsController (e2e)', () => {
  let app: INestApplication<App>;
  const skillsServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    removeFromFavorite: jest.fn(),
  };
  const accessTokenGuardMock: CanActivate = {
    canActivate(context: ExecutionContext) {
      const req = context.switchToHttp().getRequest<IRequestWithUser>();
      req.user = {
        sub: 'user-1',
        email: 'user1@example.com',
        role: UserRole.USER,
      };
      return true;
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [SkillsController],
      providers: [
        {
          provide: SkillsService,
          useValue: skillsServiceMock,
        },
      ],
    })
      .overrideGuard(AccessTokenGuard)
      .useValue(accessTokenGuardMock)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('removes a skill from favorites for the authenticated user', async () => {
    skillsServiceMock.removeFromFavorite.mockResolvedValue({
      message: 'Навык удален из избранного',
    });

    await request(app.getHttpServer())
      .delete('/skills/skill-1/favorite')
      .expect(200)
      .expect({ message: 'Навык удален из избранного' });

    expect(skillsServiceMock.removeFromFavorite).toHaveBeenCalledWith(
      'skill-1',
      'user-1',
    );
  });
});
