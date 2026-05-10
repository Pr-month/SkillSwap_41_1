import { Test, TestingModule } from '@nestjs/testing';
import { WsJwtService } from './ws-jwt.guard';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { jwtConfig } from '../../config/jwt.config';
import { SocketWithUser } from '../notifications.type';

const mockJwtConfig = { accessSecret: 'test-secret' };

const mockJwtService = {
  verify: jest.fn(),
};

const createMockClient = (token?: string) =>
  ({
    handshake: { query: token !== undefined ? { token } : {} },
    data: {},
  }) as unknown as SocketWithUser;

describe('WsJwtService', () => {
  let service: WsJwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WsJwtService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: jwtConfig.KEY, useValue: mockJwtConfig },
      ],
    }).compile();

    service = module.get<WsJwtService>(WsJwtService);
    jest.clearAllMocks();
  });

  it('should return the payload for a valid token', () => {
    const expectedPayload = { sub: 'user-123', email: 'test@test.com' };
    mockJwtService.verify.mockReturnValue(expectedPayload);

    const client = createMockClient('valid.jwt.token');
    const result = service.validate(client);

    expect(mockJwtService.verify).toHaveBeenCalledWith('valid.jwt.token', {
      secret: 'test-secret',
    });
    expect(result).toEqual(expectedPayload);
  });

  it('should throw WsException when token is missing', () => {
    const client = createMockClient();

    expect(() => service.validate(client)).toThrow(WsException);
    expect(() => service.validate(client)).toThrow('Token is required');
  });

  it('should throw WsException when token is invalid or expired', () => {
    mockJwtService.verify.mockImplementation(() => {
      throw new Error('jwt expired');
    });

    const client = createMockClient('expired.token');

    expect(() => service.validate(client)).toThrow(WsException);
    expect(() => service.validate(client)).toThrow('Invalid or expired token');
  });
});