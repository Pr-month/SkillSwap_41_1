/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  ExecutionContext,
} from '@nestjs/common';
import request from 'supertest';
import { SkillsController } from '../src/skills/skills.controller';
import { SkillsService } from '../src/skills/skills.service';
import { AccessTokenGuard } from '../src/auth/guards/access-token.guard';
import { IRequestWithUser } from '../src/auth/auth.types';
import { UserRole } from '../src/users/entities/enums/users.enums';

const MOCK_USER = {
  sub: 'test-user-id',
  email: 'test@example.com',
  role: UserRole.ADMIN,
};

class MockAuthGuard {
  canActivate(context: ExecutionContext) {
    const req: IRequestWithUser = context.switchToHttp().getRequest();
    req.user = MOCK_USER;
    return true;
  }
}

const mockSkillsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  addToFavorite: jest.fn(),
  getSimilarUsersForSkill: jest.fn(),
};

describe('SkillsController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [SkillsController],
      providers: [{ provide: SkillsService, useValue: mockSkillsService }],
    })
      .overrideGuard(AccessTokenGuard)
      .useValue(new MockAuthGuard())
      .compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a skill', async () => {
    const dto = {
      title: 'TypeScript',
      categoryId: '30595ae1-40a4-4766-8700-21371d8a1471',
    };
    const expected = {
      id: 'skill-1',
      description: undefined,
      images: undefined,
      ...dto,
    };
    mockSkillsService.create.mockResolvedValue(expected);

    const response = await request(app.getHttpServer())
      .post('/skills')
      .send(dto)
      .expect(201);

    expect(response.body).toEqual(expected);
    expect(mockSkillsService.create).toHaveBeenCalled();
  });

  it('should return 400 on invalid DTO', async () => {
    const response = await request(app.getHttpServer())
      .post('/skills')
      .send({ level: 'invalid' }) // name отсутствует
      .expect(400);

    expect(response.body).toHaveProperty('message');
    expect(mockSkillsService.create).not.toHaveBeenCalled();
  });

  it('should return paginated skills', async () => {
    const query = { page: '1', limit: '10' };
    const expected = { data: [], page: 1, totalPages: 0 };
    mockSkillsService.findAll.mockResolvedValue(expected);

    const response = await request(app.getHttpServer())
      .get('/skills')
      .query(query)
      .expect(200);

    expect(response.body).toEqual(expected);
    expect(mockSkillsService.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, limit: 10 }),
    );
  });

  it('should return a skill by id', async () => {
    const id = 'skill-123';
    const expected = { id, name: 'React' };
    mockSkillsService.findOne.mockResolvedValue(expected);

    const response = await request(app.getHttpServer())
      .get(`/skills/${id}`)
      .expect(200);
    expect(response.body).toEqual(expected);
    expect(mockSkillsService.findOne).toHaveBeenCalledWith(id);
  });

  it('should return similar users for skill', async () => {
    const id = 'skill-123';
    const expected = [{ id: 'u1' }, { id: 'u2' }];
    mockSkillsService.getSimilarUsersForSkill.mockResolvedValue(expected);

    const response = await request(app.getHttpServer())
      .get(`/skills/${id}/similar`)
      .expect(200);

    expect(response.body).toEqual(expected);
    expect(mockSkillsService.getSimilarUsersForSkill).toHaveBeenCalledWith(id);
  });

  it('should update a skill', async () => {
    const id = 'skill-123';
    const dto = { title: 'Updated Name' };
    const expected = { id, ...dto };
    mockSkillsService.update.mockResolvedValue(expected);

    const response = await request(app.getHttpServer())
      .patch(`/skills/${id}`)
      .send(dto)
      .expect(200);

    expect(response.body).toEqual(expected);
    expect(mockSkillsService.update).toHaveBeenCalledWith(
      id,
      dto,
      MOCK_USER.sub,
    );
  });

  it('should remove a skill', async () => {
    const id = 'skill-123';
    mockSkillsService.remove.mockResolvedValue(undefined);

    await request(app.getHttpServer()).delete(`/skills/${id}`).expect(200);
    expect(mockSkillsService.remove).toHaveBeenCalledWith(id, MOCK_USER.sub);
  });

  it('should add skill to favorites', async () => {
    const id = 'skill-123';
    const expectedUser = { id: MOCK_USER.sub, favorites: [id] };
    mockSkillsService.addToFavorite.mockResolvedValue(expectedUser);

    const response = await request(app.getHttpServer())
      .post(`/skills/${id}/favorite`)
      .expect(201);

    expect(response.body).toEqual(expectedUser);
    expect(mockSkillsService.addToFavorite).toHaveBeenCalledWith(
      id,
      MOCK_USER.sub,
    );
  });
});
