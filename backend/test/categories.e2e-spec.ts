/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Category } from '../src/categories/entities/category.entity';
import { AuthService } from '../src/auth/auth.service';
import { createTestingApp } from './setup';
import { testUsers } from '../src/seeding/data/user.array';

describe('CategoriesController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let categoriesRepository: Repository<Category>;
  let authService: AuthService;
  let accessTokenAdmin: string;
  let accessTokenUser: string;
  let category: Category;

  beforeAll(async () => {
    app = await createTestingApp();

    dataSource = app.get(DataSource);

    categoriesRepository = app.get(getRepositoryToken(Category));

    authService = app.get<AuthService>(AuthService);
  });

  beforeEach(async () => {
    category = (await categoriesRepository.findOne({
      where: {
        name: 'Дизайн и UX/UI',
      },
    })) as Category;

    accessTokenUser = (
      await authService.login({
        email: testUsers[0].email,
        password: testUsers[0].password,
      })
    ).tokens.accessToken;

    accessTokenAdmin = (
      await authService.login({
        email: 'admin@admin.com',
        password: 'admin123456',
      })
    ).tokens.accessToken;
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  describe('POST /categories', () => {
    it('should create category', async () => {
      const response = await request(app.getHttpServer())
        .post('/categories')
        .set('Cookie', `accessToken=${accessTokenAdmin}`)
        .send({
          name: 'Дизайн и UX/UI',
        })
        .expect(201);

      expect(response.body.name).toBe('Дизайн и UX/UI');

      const category = await categoriesRepository.findOne({
        where: {
          id: response.body.id,
        },
      });

      expect(category).not.toBeNull();
    });

    it('should create child category', async () => {
      const response = await request(app.getHttpServer())
        .post('/categories')
        .set('Cookie', `accessToken=${accessTokenAdmin}`)
        .send({
          name: 'BackendNew',
          parentId: category.id,
        })
        .expect(201);

      expect(response.body.name).toBe('BackendNew');
    });

    it('should return 404 if parent not found', async () => {
      await request(app.getHttpServer())
        .post('/categories')
        .set('Cookie', `accessToken=${accessTokenAdmin}`)
        .send({
          name: 'Backend',
          parentId: '00000000-0000-0000-0000-000000000000',
        })
        .expect(404);
    });

    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .post('/categories')
        .send({
          name: 'Дизайн и UX/UI',
        })
        .expect(401);
    });

    it('should return 403 for non-admin', async () => {
      await request(app.getHttpServer())
        .post('/categories')
        .set('Cookie', `accessToken=${accessTokenUser}`)
        .send({
          name: 'Дизайн и UX/UI',
        })
        .expect(403);
    });
  });

  describe('GET /categories', () => {
    it('should return nested categories', async () => {
      const response = await request(app.getHttpServer())
        .get('/categories')
        .expect(200);

      expect(response.body.length).toBe(9);

      expect(response.body[0].children.length).toBe(8);

      expect(response.body[0].children[0].name).toBe('Управление командой');
    });
  });

  describe('PATCH /categories/:id', () => {
    it('should update category name', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/categories/${category.id}`)
        .set('Cookie', `accessToken=${accessTokenAdmin}`)
        .send({
          name: 'Дизайн и UX/UI Updated',
        })
        .expect(200);

      expect(response.body.name).toBe('Дизайн и UX/UI Updated');
    });

    it('should return 400 for own parent', async () => {
      await request(app.getHttpServer())
        .patch(`/categories/${category.id}`)
        .set('Cookie', `accessToken=${accessTokenAdmin}`)
        .send({
          parentId: category.id,
        })
        .expect(400);
    });

    it('should return 404 if category not found', async () => {
      await request(app.getHttpServer())
        .patch('/categories/00000000-0000-0000-0000-000000000000')
        .set('Cookie', `accessToken=${accessTokenAdmin}`)
        .send({
          name: 'Updated',
        })
        .expect(404);
    });

    it('should return 403 for non-admin', async () => {
      await request(app.getHttpServer())
        .patch(`/categories/${category.id}`)
        .set('Cookie', `accessToken=${accessTokenUser}`)
        .send({
          name: 'Updated',
        })
        .expect(403);
    });
  });

  describe('DELETE /categories/:id', () => {
    it('should delete category', async () => {
      await request(app.getHttpServer())
        .delete(`/categories/${category.id}`)
        .set('Cookie', `accessToken=${accessTokenAdmin}`)
        .expect(200);

      const deleted = await categoriesRepository.findOne({
        where: {
          id: category.id,
        },
      });

      expect(deleted).toBeNull();
    });

    it('should return 400 if category has children', async () => {
      const parent = await categoriesRepository.save({
        name: 'Programming',
      });

      await categoriesRepository.save({
        name: 'Backend',
        parent,
      });

      await request(app.getHttpServer())
        .delete(`/categories/${parent.id}`)
        .set('Cookie', `accessToken=${accessTokenAdmin}`)
        .expect(400);
    });

    it('should return 404 if category not found', async () => {
      await request(app.getHttpServer())
        .delete('/categories/00000000-0000-0000-0000-000000000000')
        .set('Cookie', `accessToken=${accessTokenAdmin}`)
        .expect(404);
    });

    it('should return 403 for non-admin', async () => {
      const category = await categoriesRepository.save({
        name: 'Programming',
      });

      await request(app.getHttpServer())
        .delete(`/categories/${category.id}`)
        .set('Cookie', `accessToken=${accessTokenUser}`)
        .expect(403);
    });
  });
});
