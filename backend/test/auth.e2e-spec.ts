/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../src/users/entities/user.entity';
import { Gender } from '../src/users/entities/enums/users.enums';
import { createTestingApp } from './setup';
import { AuthService } from '../src/auth/auth.service';
import { testUsers } from '../src/seeding/data/user.array';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  let dataSource: DataSource;
  let authService: AuthService;
  let usersRepository: Repository<User>;

  beforeAll(async () => {
    app = await createTestingApp();

    dataSource = app.get(DataSource);

    usersRepository = app.get(getRepositoryToken(User));
    authService = app.get<AuthService>(AuthService);
  });

  beforeEach(async () => {});

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  describe('POST /auth/register', () => {
    afterAll(async () => {
      await usersRepository.delete({ email: 'denis@test.com' })
    })

    it('should register user', async () => {
      const response: request.Response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'denis@test.com',
          password: 'password123',
          name: 'Denis',
          about: 'Simple user',
          birthdate: '2000-01-01',
          cityId: 1,
          gender: Gender.MALE,
        })
        .expect(201);

      expect(response.body.user.email).toBe('denis@test.com');

      const cookies = response.headers['set-cookie'];

      expect(cookies).toBeDefined();

      const user = await usersRepository.findOne({
        where: {
          email: 'denis@test.com',
        },
      });

      expect(user).not.toBeNull();

      expect(user?.password).not.toBe('password123');
    });

    it('should return 409 for duplicate email', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'denis@test.com',
          password: 'password123',
          name: 'Denis',
          about: 'Simple user',
          birthdate: '2000-01-01',
          cityId: 1,
          gender: Gender.MALE,
        })
        .expect(409);
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {});

    it('should login user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'anna.petrova@test.com',
          password: 'user123456',
        })
        .expect(200);

      expect(response.body.user.email).toBe('anna.petrova@test.com');

      const cookies = response.headers['set-cookie'];

      expect(cookies).toBeDefined();
    });

    it('should return 401 for wrong password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'anna.petrova@test.com',
          password: 'wrong-password',
        })
        .expect(401);
    });

    it('should return 401 for missing user', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'missing@test.com',
          password: 'password123',
        })
        .expect(401);
    });
  });

  describe('POST /auth/logout', () => {
    let accessTokenUser: string;
    beforeEach(async () => {
      accessTokenUser = (
        await authService.login({
          email: testUsers[1].email,
          password: testUsers[1].password,
        })
      ).tokens.accessToken;
    });

    it('should logout user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Cookie', `accessToken=${accessTokenUser}`)
        .expect(200);

      expect(response.body.message).toBe('Вы успешно вышли из аккаунта');

      const user = await usersRepository.findOne({
        where: {
          email: 'testUsers[1].email',
        },
      });

      expect(user?.refreshToken).toBeUndefined();
    });

    it('should return 401 without auth', async () => {
      await request(app.getHttpServer()).post('/auth/logout').expect(401);
    });
  });
});
