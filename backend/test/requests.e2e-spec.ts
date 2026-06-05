import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  ExecutionContext,
} from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { RequestsController } from '../src/requests/requests.controller';
import { RequestsService } from '../src/requests/requests.service';
import { RequestStatus } from '../src/requests/entities/request.enum';
import { AccessTokenGuard } from '../src/auth/guards/access-token.guard';

describe('RequestsController (e2e)', () => {
  let app: INestApplication;
  let server: App;

  const requestsServiceMock = {
    create: jest.fn(),
    update: jest.fn(),
    findIncoming: jest.fn(),
    findOutgoing: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [RequestsController],
      providers: [
        {
          provide: RequestsService,
          useValue: requestsServiceMock,
        },
      ],
    })
      .overrideGuard(AccessTokenGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context
            .switchToHttp()
            .getRequest<Record<string, unknown>>();
          req['user'] = { sub: 'test-user-id', role: 'USER' };
          return true;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    await app.init();
    server = app.getHttpServer() as unknown as App;
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /requests', () => {
    it('should create a request and return 201', async () => {
      const createDto = {
        offeredSkillId: '123e4567-e89b-12d3-a456-426614174000',
        requestedSkillId: '987fcdeb-51a2-43d7-9012-34567890abcd',
      };
      const expectedResult = {
        id: 'req-1',
        ...createDto,
        status: RequestStatus.PENDING,
      };

      requestsServiceMock.create.mockResolvedValue(expectedResult);

      const response = await request(server)
        .post('/requests')
        .send(createDto)
        .expect(201);

      expect(response.body).toEqual(expectedResult);
      expect(requestsServiceMock.create).toHaveBeenCalledWith(
        createDto,
        'test-user-id',
      );
    });

    it('should return 400 if DTO is incomplete', async () => {
      await request(server)
        .post('/requests')
        .send({ offeredSkillId: 'skill-1' })
        .expect(400);
    });
  });

  describe('GET /requests/incoming', () => {
    it('should return incoming requests for the current user', async () => {
      const requests = [{ id: 'req-2', status: RequestStatus.PENDING }];
      requestsServiceMock.findIncoming.mockResolvedValue(requests);

      const response = await request(server)
        .get('/requests/incoming')
        .expect(200);

      expect(response.body).toEqual(requests);
      expect(requestsServiceMock.findIncoming).toHaveBeenCalledWith(
        'test-user-id',
      );
    });
  });

  describe('GET /requests/outgoing', () => {
    it('should return outgoing requests for the current user', async () => {
      const requests = [{ id: 'req-3', status: RequestStatus.ACCEPTED }];
      requestsServiceMock.findOutgoing.mockResolvedValue(requests);

      const response = await request(server)
        .get('/requests/outgoing')
        .expect(200);

      expect(response.body).toEqual(requests);
      expect(requestsServiceMock.findOutgoing).toHaveBeenCalledWith(
        'test-user-id',
      );
    });
  });

  describe('PATCH /requests/:id', () => {
    it('should update request status', async () => {
      const updateDto = { status: RequestStatus.ACCEPTED };
      const expectedResult = { id: 'req-1', status: RequestStatus.ACCEPTED };

      requestsServiceMock.update.mockResolvedValue(expectedResult);

      const response = await request(server)
        .patch('/requests/req-1')
        .send(updateDto)
        .expect(200);

      expect(response.body).toEqual(expectedResult);
      expect(requestsServiceMock.update).toHaveBeenCalledWith(
        'req-1',
        updateDto,
        expect.objectContaining({
          user: {
            sub: 'test-user-id',
            role: 'USER',
          },
        }),
      );
    });
  });

  describe('DELETE /requests/:id', () => {
    it('should delete the request', async () => {
      requestsServiceMock.remove.mockResolvedValue(undefined);

      await request(server).delete('/requests/req-1').expect(204);

      expect(requestsServiceMock.remove).toHaveBeenCalledWith(
        'req-1',
        expect.objectContaining({
          user: {
            sub: 'test-user-id',
            role: 'USER',
          },
        }),
      );
    });
  });
});
