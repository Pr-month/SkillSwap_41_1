import {
  INestApplication,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { RequestsController } from '../src/requests/requests.controller';
import { RequestsService } from '../src/requests/requests.service';
import { AccessTokenGuard } from '../src/auth/guards/access-token.guard';
import { IRequestWithUser } from '../src/auth/auth.types';
import { UserRole } from '../src/users/entities/enums/users.enums';

describe('RequestsController (e2e)', () => {
  let app: INestApplication<App>;
  const requestsServiceMock = {
    findIncoming: jest.fn(),
    findOutgoing: jest.fn(),
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
      controllers: [RequestsController],
      providers: [
        {
          provide: RequestsService,
          useValue: requestsServiceMock,
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

  it('returns incoming requests for the authenticated user', async () => {
    const incomingRequests = [{ id: 'request-1' }];
    requestsServiceMock.findIncoming.mockResolvedValue(incomingRequests);

    await request(app.getHttpServer())
      .get('/requests/incoming')
      .expect(200)
      .expect(incomingRequests);

    expect(requestsServiceMock.findIncoming).toHaveBeenCalledWith('user-1');
  });

  it('returns outgoing requests for the authenticated user', async () => {
    requestsServiceMock.findOutgoing.mockResolvedValue([{ id: 'request-1' }]);

    await request(app.getHttpServer())
      .get('/requests/outgoing')
      .expect(200)
      .expect([{ id: 'request-1' }]);

    expect(requestsServiceMock.findOutgoing).toHaveBeenCalledWith('user-1');
  });
});
