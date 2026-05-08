import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsGateway } from './notifications.gateway';
import { WsJwtService } from './guards/ws-jwt.guard';
import { NotificationType, SocketWithUser } from './notifications.type';
import { Server } from 'socket.io';

const mockPayload = { sub: 'user-123', email: 'test@test.com' };

const createMockClient = (): jest.Mocked<SocketWithUser> =>
  ({
    handshake: { query: { token: 'valid.jwt.token' } },
    data: {},
    join: jest.fn(),
    disconnect: jest.fn(),
    emit: jest.fn(),
  }) as any;

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
      const client = createMockClient();
      mockWsJwtService.validate.mockReturnValue(mockPayload);

      await gateway.handleConnection(client);

      expect(mockWsJwtService.validate).toHaveBeenCalledWith(client);
      expect(client.data.user).toEqual(mockPayload);
      expect(client.join).toHaveBeenCalledWith('user-123');
      expect(client.disconnect).not.toHaveBeenCalled();
    });

    it('should disconnect if validate returns null', async () => {
      const client = createMockClient();
      mockWsJwtService.validate.mockReturnValue(null);

      await gateway.handleConnection(client);

      expect(client.disconnect).toHaveBeenCalled();
      expect(client.join).not.toHaveBeenCalled();
    });

    it('should disconnect if validate returns a payload without sub', async () => {
      const client = createMockClient();
      mockWsJwtService.validate.mockReturnValue({ email: 'test@test.com' }); // no sub

      await gateway.handleConnection(client);

      expect(client.disconnect).toHaveBeenCalled();
      expect(client.join).not.toHaveBeenCalled();
    });

    it('should disconnect if validate throws', async () => {
      const client = createMockClient();
      mockWsJwtService.validate.mockImplementation(() => {
        throw new Error('Token expired');
      });

      await gateway.handleConnection(client);

      expect(client.disconnect).toHaveBeenCalled();
      expect(client.join).not.toHaveBeenCalled();
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

      expect(gateway.server.to).not.toHaveBeenCalledWith('user-999');
    });
  });
});
