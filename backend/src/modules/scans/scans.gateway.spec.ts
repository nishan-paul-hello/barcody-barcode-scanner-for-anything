import { Test, TestingModule } from '@nestjs/testing';
import { ScansGateway } from './scans.gateway';
import { JwtAuthService } from '@/modules/auth/jwt-auth.service';
import { Server, Socket } from 'socket.io';

describe('ScansGateway', () => {
  let gateway: ScansGateway;
  let jwtAuthService: JwtAuthService;

  const mockJwtAuthService = {
    validateAccessToken: jest.fn(),
  };

  const mockSocket = {
    id: 'socket-123',
    handshake: {
      auth: {},
      query: {},
      headers: {},
    },
    join: jest.fn().mockResolvedValue(undefined),
    leave: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn(),
    data: {},
  } as unknown as Socket;

  const mockServer = {
    to: jest.fn().mockReturnThis(),
    emit: jest.fn(),
  } as unknown as Server;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScansGateway,
        {
          provide: JwtAuthService,
          useValue: mockJwtAuthService,
        },
      ],
    }).compile();

    gateway = module.get<ScansGateway>(ScansGateway);
    jwtAuthService = module.get<JwtAuthService>(JwtAuthService);
    gateway.server = mockServer;
  });

  afterEach(() => {
    jest.clearAllMocks();
    (mockSocket as any).data = {};
    (mockSocket.handshake as any).auth = {};
    (mockSocket.handshake as any).query = {};
    (mockSocket.handshake as any).headers = {};
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should authenticate and join room with valid token in auth', async () => {
      const token = 'valid-token';
      const payload = { sub: 'user-123', email: 'test@example.com' };
      (mockSocket.handshake.auth as any).token = token;
      mockJwtAuthService.validateAccessToken.mockResolvedValue(payload);

      await gateway.handleConnection(mockSocket);

      expect(jwtAuthService.validateAccessToken).toHaveBeenCalledWith(token);
      expect(mockSocket.join).toHaveBeenCalledWith('user:user-123');
      expect(mockSocket.data.user).toEqual(payload);
    });

    it('should authenticate and join room with valid token in query', async () => {
      const token = 'query-token';
      const payload = { sub: 'user-456', email: 'test2@example.com' };
      (mockSocket.handshake.query as any).token = token;
      mockJwtAuthService.validateAccessToken.mockResolvedValue(payload);

      await gateway.handleConnection(mockSocket);

      expect(jwtAuthService.validateAccessToken).toHaveBeenCalledWith(token);
      expect(mockSocket.join).toHaveBeenCalledWith('user:user-456');
    });

    it('should disconnect if no token is provided', async () => {
      await gateway.handleConnection(mockSocket);

      expect(mockSocket.disconnect).toHaveBeenCalled();
      expect(jwtAuthService.validateAccessToken).not.toHaveBeenCalled();
    });

    it('should disconnect if token is invalid', async () => {
      (mockSocket.handshake.auth as any).token = 'invalid-token';
      mockJwtAuthService.validateAccessToken.mockRejectedValue(new Error('Invalid token'));

      await gateway.handleConnection(mockSocket);

      expect(mockSocket.disconnect).toHaveBeenCalled();
    });
  });

  describe('handleDisconnect', () => {
    it('should leave room if user was authenticated', async () => {
      (mockSocket as any).data.user = { sub: 'user-123' };

      await gateway.handleDisconnect(mockSocket);

      expect(mockSocket.leave).toHaveBeenCalledWith('user:user-123');
      expect(mockSocket.data.user).toBeUndefined();
    });
  });

  describe('event emitters', () => {
    it('should emit scan:created to correct room', () => {
      const userId = 'user-123';
      const scan = { id: 'scan-1' } as any;

      gateway.emitScanCreated(userId, scan);

      expect(mockServer.to).toHaveBeenCalledWith('user:user-123');
      expect(mockServer.emit).toHaveBeenCalledWith('scan:created', scan);
    });

    it('should emit scan:deleted to correct room', () => {
      const userId = 'user-123';
      const scanId = 'scan-1';

      gateway.emitScanDeleted(userId, scanId);

      expect(mockServer.to).toHaveBeenCalledWith('user:user-123');
      expect(mockServer.emit).toHaveBeenCalledWith('scan:deleted', { id: scanId });
    });
  });
});
