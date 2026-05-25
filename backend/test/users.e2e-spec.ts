/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../src/users/entities/user.entity';

import { Gender, UserRole } from '../src/users/entities/enums/users.enums';
import { createTestingApp } from './setup';
import { AuthService } from '../src/auth/auth.service';
import { testUsers } from '../src/seeding/data/user.array';

describe('UsersController (e2e)', () => {
  let app: INestApplication;

  let dataSource: DataSource;

  let usersRepository: Repository<User>;
  let authService: AuthService;

  let accessTokenUser: string;
  let accessTokenAdmin: string;
  let userTest: User | null;

  beforeAll(async () => {
    app = await createTestingApp();
    dataSource = app.get(DataSource);
    usersRepository = app.get(getRepositoryToken(User));
    authService = app.get<AuthService>(AuthService);
  });

  beforeEach(async () => {
    userTest = await usersRepository.findOne({
      where: {
        email: testUsers[0].email,
      },
    });

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

  describe('GET /users', () => {
    it('should return paginated users', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .expect(200);

      expect(response.body.data).toHaveLength(3);
      expect(response.body.page).toBe(1);
      expect(response.body.totalPages).toBe(1);

      expect(response.body.data[0].password).toBeUndefined();

      expect(response.body.data[0].refreshToken).toBeUndefined();
    });

    it('should return 404 for page not found', async () => {
      await request(app.getHttpServer())
        .get('/users?page=100&limit=10')
        .expect(404);
    });
  });

  describe('GET /users/me', () => {
    it('should return current user', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/me')
        .set('Cookie', `accessToken=${accessTokenUser}`)
        .expect(200);

      expect(response.body.name).toBe(testUsers[0].name);
      expect(response.body.email).toBe(testUsers[0].email);

      expect(response.body.password).toBeUndefined();

      expect(response.body.refreshToken).toBeUndefined();
    });

    it('should return 401 without auth', async () => {
      await request(app.getHttpServer()).get('/users/me').expect(401);
    });
  });

  describe('GET /users/:id', () => {
    it('should return user by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${userTest?.id}`)
        .expect(200);

      expect(response.body.name).toBe(testUsers[0].name);

      expect(response.body.password).toBeUndefined();

      expect(response.body.refreshToken).toBeUndefined();
    });

    it('should return null if user not found', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/00000000-0000-0000-0000-000000000000')
        .expect(200);

      expect(response.body).toStrictEqual({});
    });
  });

  describe('PATCH /users/me', () => {
    it('should update profile', async () => {
      const response = await request(app.getHttpServer())
        .patch('/users/me')
        .set('Cookie', `accessToken=${accessTokenUser}`)
        .send({
          avatar: 'avatar.jpg',
        })
        .expect(200);

      expect(response.body.avatar).toBe('avatar.jpg');
    });

    it('should return 400 for invalid city', async () => {
      await request(app.getHttpServer())
        .patch('/users/me')
        .set('Cookie', `accessToken=${accessTokenUser}`)
        .send({
          cityId: 99999,
        })
        .expect(400);
    });

    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .patch('/users/me')
        .send({
          name: 'Updated',
        })
        .expect(401);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete user as admin', async () => {
      const user = await usersRepository.save({
        name: 'Test',
        email: 'test@localhost',
        password: 'test123456',
        city: null,
        birthdate: new Date('1990-01-01'),
        gender: Gender.MALE,
        role: UserRole.USER,
      });
      await request(app.getHttpServer())
        .delete(`/users/${user.id}`)
        .set('Cookie', `accessToken=${accessTokenAdmin}`)
        .expect(204);

      const deleted = await usersRepository.findOne({
        where: {
          id: user.id,
        },
      });

      expect(deleted).toBeNull();
    });

    it('should return 403 for non-admin', async () => {
      await request(app.getHttpServer())
        .delete(`/users/${userTest?.id}`)
        .set('Cookie', `accessToken=${accessTokenUser}`)
        .expect(403);
    });

    it('should return 404 if user not found', async () => {
      await request(app.getHttpServer())
        .delete('/users/00000000-0000-0000-0000-000000000000')
        .set('Cookie', `accessToken=${accessTokenAdmin}`)
        .expect(404);
    });

    it('should return 401 without auth', async () => {
      await request(app.getHttpServer()).delete(`/users/1`).expect(401);
    });
  });
});
