/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { INestApplication } from '@nestjs/common';

import request from 'supertest';

import { DataSource, Repository } from 'typeorm';

import { getRepositoryToken } from '@nestjs/typeorm';

import { Skill } from '../src/skills/entities/skill.entity';
import { Category } from '../src/categories/entities/category.entity';
import { User } from '../src/users/entities/user.entity';

import { createTestingApp } from './setup';
import { testUsers } from '../src/seeding/data/user.array';
import { AuthService } from '../src/auth/auth.service';

describe('SkillsController (e2e)', () => {
  let app: INestApplication;

  let dataSource: DataSource;

  let skillsRepository: Repository<Skill>;
  let categoriesRepository: Repository<Category>;
  let usersRepository: Repository<User>;
  let authService: AuthService;

  let accessToken: string;

  let user: User;
  let category: Category;

  beforeAll(async () => {
    app = await createTestingApp();

    dataSource = app.get(DataSource);

    skillsRepository = app.get(getRepositoryToken(Skill));
    categoriesRepository = app.get(getRepositoryToken(Category));
    usersRepository = app.get(getRepositoryToken(User));
    authService = app.get<AuthService>(AuthService);
  });

  beforeEach(async () => {
    user = (await usersRepository.findOne({
      where: {
        email: testUsers[0].email,
      },
    })) as User;

    category = (await categoriesRepository.findOne({
      where: {
        name: 'IT и программирование',
      },
    })) as Category;

    accessToken = (
      await authService.login({
        email: testUsers[0].email,
        password: testUsers[0].password,
      })
    ).tokens.accessToken;
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  describe('POST /skills', () => {
    it('should create skill', async () => {
      const dto = {
        title: 'NestJS',
        description: 'Backend framework',
        categoryId: category.id,
        images: [],
      };

      const response = await request(app.getHttpServer())
        .post('/skills')
        .set('Cookie', `accessToken=${accessToken}`)
        .send(dto)
        .expect(201);

      expect(response.body.title).toBe(dto.title);

      const skill = await skillsRepository.findOne({
        where: {
          id: response.body.id,
        },
      });

      expect(skill).not.toBeNull();
    });

    it('should return 401 without token', async () => {
      await request(app.getHttpServer()).post('/skills').send({}).expect(401);
    });

    it('should return 404 if category does not exist', async () => {
      await request(app.getHttpServer())
        .post('/skills')
        .set('Cookie', `accessToken=${accessToken}`)
        .send({
          title: 'NestJS',
          categoryId: '00000000-0000-0000-0000-000000000000',
        })
        .expect(404);
    });
  });

  describe('GET /skills', () => {
    it('should return paginated skills', async () => {
      const response = await request(app.getHttpServer())
        .get('/skills?page=1&limit=10')
        .expect(200);

      expect(response.body.page).toBe(1);
      expect(response.body.data.length).toBe(7);
    });

    it('should filter by search', async () => {
      const response = await request(app.getHttpServer())
        .get('/skills?page=1&limit=10&search=React')
        .expect(200);

      expect(response.body.data.length).toBe(1);
    });

    it('should return 404 for missing page', async () => {
      await request(app.getHttpServer())
        .get('/skills?page=100&limit=10')
        .expect(404);
    });
  });

  describe('GET /skills/:id', () => {
    it('should return skill', async () => {
      const skill = await skillsRepository.save({
        title: 'Vue',
        description: 'Frontend',
        images: [],
        category,
        owner: user,
      });

      const response = await request(app.getHttpServer())
        .get(`/skills/${skill.id}`)
        .expect(200);

      expect(response.body.id).toBe(skill.id);
    });

    it('should return 404', async () => {
      await request(app.getHttpServer())
        .get('/skills/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  describe('PATCH /skills/:id', () => {
    it('should update own skill', async () => {
      const skill = await skillsRepository.save({
        title: 'Angular',
        description: 'Frontend',
        images: [],
        category,
        owner: user,
      });

      const response = await request(app.getHttpServer())
        .patch(`/skills/${skill.id}`)
        .set('Cookie', `accessToken=${accessToken}`)
        .send({
          title: 'Angular 2',
        })
        .expect(200);

      expect(response.body.title).toBe('Angular 2');
    });
  });

  describe('DELETE /skills/:id', () => {
    it('should remove own skill', async () => {
      const skill = await skillsRepository.save({
        title: 'Go',
        description: 'Backend',
        images: [],
        category,
        owner: user,
      });

      await request(app.getHttpServer())
        .delete(`/skills/${skill.id}`)
        .set('Cookie', `accessToken=${accessToken}`)
        .expect(200);

      const deletedSkill = await skillsRepository.findOne({
        where: {
          id: skill.id,
        },
      });

      expect(deletedSkill).toBeNull();
    });
  });
});
