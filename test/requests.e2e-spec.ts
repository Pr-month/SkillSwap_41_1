import {
  CanActivate,
  ExecutionContext,
  INestApplication,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AccessTokenGuard } from '../src/auth/guards/access-token.guard';
import { IRequestWithUser } from '../src/auth/auth.types';
import { RequestsController } from '../src/requests/requests.controller';
import { RequestsService } from '../src/requests/requests.service';
import { UserRole } from '../src/users/entities/enums/users.enums';

describe('RequestsController (e2e)', () => {
  let app: INestApplication<App>;
  const requestsServiceMock = {
    create: jest.fn(),
  };
  const accessTokenGuardMock: CanActivate = {
    canActivate(context: ExecutionContext) {
      const req = context.switchToHttp().getRequest<IRequestWithUser>();
      req.user = {
        sub: 'sender-1',
        email: 'sender@example.com',
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

  it('creates a request for the authenticated user', async () => {
    requestsServiceMock.create.mockResolvedValue({ id: 'request-1' });

    await request(app.getHttpServer())
      .post('/requests')
      .send({
        receiverId: 'receiver-1',
        offeredSkillId: 'skill-1',
        requestedSkillId: 'skill-2',
      })
      .expect(201)
      .expect({ id: 'request-1' });

    expect(requestsServiceMock.create).toHaveBeenCalledWith(
      {
        receiverId: 'receiver-1',
        offeredSkillId: 'skill-1',
        requestedSkillId: 'skill-2',
      },
      'sender-1',
    );
  });
});
