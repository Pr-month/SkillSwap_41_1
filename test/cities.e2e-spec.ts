import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { CitiesController } from '../src/cities/cities.controller';
import { CitiesService } from '../src/cities/cities.service';

describe('CitiesController (e2e)', () => {
  let app: INestApplication<App>;
  const citiesServiceMock = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [CitiesController],
      providers: [
        {
          provide: CitiesService,
          useValue: citiesServiceMock,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('returns cities and forwards search query to the service', async () => {
    citiesServiceMock.findAll.mockResolvedValue([{ id: '1', name: 'Berlin' }]);

    await request(app.getHttpServer())
      .get('/cities?search=ber')
      .expect(200)
      .expect([{ id: '1', name: 'Berlin' }]);

    expect(citiesServiceMock.findAll).toHaveBeenCalledWith({ search: 'ber' });
  });
});
