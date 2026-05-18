import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsGateway } from './notifications.gateway';
import { WsJwtService } from './guards/ws-jwt.guard';
import { NotificationType, SocketWithUser } from './notifications.type';
import { Server } from 'socket.io';

const mockPayload = { sub: 'user-123', email: 'test@test.com' };

const createMockClient = () => {
  const joinMock = jest.fn<Promise<void>, [string]>();
  const disconnectMock = jest.fn<void, [boolean?]>();

  const client = {
    handshake: {
      query: {
        token: 'valid.jwt.token',
      },
    },
    data: {},
    join: joinMock,
    disconnect: disconnectMock,
    emit: jest.fn(),
  } as unknown as jest.Mocked<SocketWithUser>;

  return {
    client,
    joinMock,
    disconnectMock,
  };
};

const mockWsJwtService = {
  validate: jest.fn(),
};

describe('NotificationsGateway', () => {
  let gateway: NotificationsGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsGateway,
        { provide: WsJwtService, useValue: mockWsJwtService },
      ],
    }).compile();

    gateway = module.get<NotificationsGateway>(NotificationsGateway);

    gateway.server = {
      to: jest.fn().mockReturnValue({ emit: jest.fn() }),
    } as unknown as Server;

    jest.clearAllMocks();
  });

  describe('handleConnection', () => {
    it('should authenticate the client, store user data, and join a room', async () => {
      const { client, joinMock, disconnectMock } = createMockClient();
      mockWsJwtService.validate.mockReturnValue(mockPayload);

      await gateway.handleConnection(client);

      expect(mockWsJwtService.validate).toHaveBeenCalledWith(client);
      expect(client.data.user).toEqual(mockPayload);
      expect(joinMock).toHaveBeenCalledWith('user-123');
      expect(disconnectMock).not.toHaveBeenCalled();
    });

    it('should disconnect if validate returns null', async () => {
      const { client, joinMock, disconnectMock } = createMockClient();
      mockWsJwtService.validate.mockReturnValue(null);

      await gateway.handleConnection(client);

      expect(disconnectMock).toHaveBeenCalled();
      expect(joinMock).not.toHaveBeenCalled();
    });

    it('should disconnect if validate returns a payload without sub', async () => {
      const { client, joinMock, disconnectMock } = createMockClient();
      mockWsJwtService.validate.mockReturnValue({ email: 'test@test.com' }); // no sub

      await gateway.handleConnection(client);

      expect(disconnectMock).toHaveBeenCalled();
      expect(joinMock).not.toHaveBeenCalled();
    });

    it('should disconnect if validate throws', async () => {
      const { client, joinMock, disconnectMock } = createMockClient();
      mockWsJwtService.validate.mockImplementation(() => {
        throw new Error('Token expired');
      });

      await gateway.handleConnection(client);

      expect(disconnectMock).toHaveBeenCalled();
      expect(joinMock).not.toHaveBeenCalled();
    });
  });

  describe('notifyUser', () => {
    it('should emit to the correct user room with the correct payload', () => {
      const mockEmit = jest.fn();
      (gateway.server.to as jest.Mock).mockReturnValue({ emit: mockEmit });

      const payload = {
        type: NotificationType.ACCEPTED,
        skillName: 'TypeScript',
        fromUser: { id: 'sender-456', name: 'Alice' },
        timeStamp: new Date(),
      };

      gateway.notifyUser('user-123', payload);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(gateway.server.to).toHaveBeenCalledWith('user-123');
      expect(mockEmit).toHaveBeenCalledWith('notificateNewRequest', payload);
    });

    it('should not emit to a different user room', () => {
      const mockEmit = jest.fn();
      (gateway.server.to as jest.Mock).mockReturnValue({ emit: mockEmit });

      gateway.notifyUser('user-123', {
        type: NotificationType.REJECTED,
        skillName: 'React',
        fromUser: { id: 'sender-789', name: 'Bob' },
        timeStamp: new Date(),
      });

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(gateway.server.to).not.toHaveBeenCalledWith('user-999');
    });
  });
});
