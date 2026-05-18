import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { UsersController } from '../src/users/users.controller';
import { UsersService } from '../src/users/users.service';

describe('UsersController (e2e)', () => {
  let app: INestApplication<App>;
  const usersServiceMock = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('returns paginated users and forwards query params to the service', async () => {
    usersServiceMock.findAll.mockResolvedValue({
      data: [{ id: '1' }],
      page: 1,
      totalPages: 1,
    });

    await request(app.getHttpServer())
      .get('/users?page=1&limit=20')
      .expect(200)
      .expect({
        data: [{ id: '1' }],
        page: 1,
        totalPages: 1,
      });

    expect(usersServiceMock.findAll).toHaveBeenCalledWith({
      page: 1,
      limit: 20,
    });
  });
});
