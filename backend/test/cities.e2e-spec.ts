/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from '../src/auth/auth.service';
import { createTestingApp } from './setup';
import { testUsers } from '../src/seeding/data/user.array';
import { City } from '../src/cities/entities/city.entity';

describe('CitiesController (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let citiesRepository: Repository<City>;
  let authService: AuthService;
  let accessTokenAdmin: string;
  let accessTokenUser: string;
  let city: City;

  beforeAll(async () => {
    app = (await createTestingApp()) as INestApplication<App>;

    dataSource = app.get(DataSource);

    citiesRepository = app.get(getRepositoryToken(City));

    authService = app.get<AuthService>(AuthService);
  });

  beforeEach(async () => {
    city = (await citiesRepository.findOne({
      where: {
        name: 'Москва',
      },
    })) as City;

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
    if (dataSource) {
      await dataSource.destroy();
    }
    if (app) {
      await app.close();
    }
  });

  describe('POST /cities', () => {
    it('should create city', async () => {
      const name = Date.now().toString();

      const response = await request(app.getHttpServer())
        .post('/cities')
        .set('Cookie', `accessToken=${accessTokenAdmin}`)
        .send({ name })
        .expect(201);

      expect(response.body.name).toBe(name);

      const createdCity = await citiesRepository.findOne({
        where: {
          id: response.body.id,
        },
      });

      expect(createdCity).not.toBeNull();
    });

    it('should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .post('/cities')
        .send({
          name: 'UnauthorizedCity',
        })
        .expect(401);
    });

    it('should return 403 for non-admin', async () => {
      await request(app.getHttpServer())
        .post('/cities')
        .set('Cookie', `accessToken=${accessTokenUser}`)
        .send({
          name: 'ForbiddenCity',
        })
        .expect(403);
    });
  });

  describe('GET /cities', () => {
    it('should return cities', async () => {
      const response = await request(app.getHttpServer())
        .get('/cities')
        .expect(200);

      expect(response.body.length).not.toBe(0);
    });

    it('should return cities by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/cities/${city.id}`)
        .expect(200);

      expect(response.body.id).toBe(city.id);
      expect(response.body.name).toBe('Москва');
    });

    it('should return cities by search', async () => {
      const response = await request(app.getHttpServer())
        .get(`/cities`)
        .query({ search: 'Москва' })
        .expect(200);

      const cities = response.body as City[];

      expect(Array.isArray(cities)).toBe(true);
      expect(cities.some((item) => item.name === 'Москва')).toBe(true);
    });
  });

  describe('PATCH /cities/:id', () => {
    it('should update city', async () => {
      const cityToUpdate = await citiesRepository.save({
        name: Date.now().toString(),
      });
      const updatedName = Date.now().toString();

      const response = await request(app.getHttpServer())
        .patch(`/cities/${cityToUpdate.id}`)
        .set('Cookie', `accessToken=${accessTokenAdmin}`)
        .send({ name: updatedName })
        .expect(200);

      expect(response.body.name).toBe(updatedName);
    });

    it('should return 404 if city not found', async () => {
      await request(app.getHttpServer())
        .patch('/cities/999999999')
        .set('Cookie', `accessToken=${accessTokenAdmin}`)
        .send({
          name: Date.now().toString(),
        })
        .expect(404);
    });

    it('should return 403 for non-admin', async () => {
      await request(app.getHttpServer())
        .patch(`/cities/${city.id}`)
        .set('Cookie', `accessToken=${accessTokenUser}`)
        .send({
          name: 'UpdatedByUser',
        })
        .expect(403);
    });
  });

  describe('DELETE /cities/:id', () => {
    it('should delete city', async () => {
      const cityToDelete = await citiesRepository.save({
        name: Date.now().toString(),
      });

      await request(app.getHttpServer())
        .delete(`/cities/${cityToDelete.id}`)
        .set('Cookie', `accessToken=${accessTokenAdmin}`)
        .expect(200);

      const deleted = await citiesRepository.findOne({
        where: {
          id: cityToDelete.id,
        },
      });

      expect(deleted).toBeNull();
    });

    it('should return 404 if city not found', async () => {
      await request(app.getHttpServer())
        .delete('/cities/999999999')
        .set('Cookie', `accessToken=${accessTokenAdmin}`)
        .expect(404);
    });

    it('should return 403 for non-admin', async () => {
      const savedCity = await citiesRepository.save({
        name: Date.now().toString(),
      });

      await request(app.getHttpServer())
        .delete(`/cities/${savedCity.id}`)
        .set('Cookie', `accessToken=${accessTokenUser}`)
        .expect(403);
    });
  });
});
