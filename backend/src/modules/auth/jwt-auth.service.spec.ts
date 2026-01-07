import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthService } from './jwt-auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';
import { UnauthorizedException } from '@nestjs/common';

describe('JwtAuthService', () => {
  let service: JwtAuthService;

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const mockRedisService = {
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
    createKey: jest.fn((ns, key) => `${ns}:${key}`),
  };

  const mockConfigService = {
    get: jest.fn((key) => {
      if (key === 'JWT_SECRET') return 'test_secret';
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: RedisService, useValue: mockRedisService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<JwtAuthService>(JwtAuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateAccessToken', () => {
    it('should generate an access token', async () => {
      mockJwtService.signAsync.mockResolvedValue('access_token');
      const token = await service.generateAccessToken('user1', 'test@example.com');
      expect(token).toBe('access_token');
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({ sub: 'user1', email: 'test@example.com', type: 'access' }),
        expect.objectContaining({ expiresIn: '15m', secret: 'test_secret' }),
      );
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate and store a refresh token', async () => {
      mockJwtService.signAsync.mockResolvedValue('refresh_token');
      const token = await service.generateRefreshToken('user1', 'test@example.com');
      expect(token).toBe('refresh_token');
      expect(mockRedisService.set).toHaveBeenCalledWith(
        'refresh_token:user1',
        'refresh_token',
        7 * 24 * 60 * 60,
      );
    });
  });

  describe('validateRefreshToken', () => {
    it('should validate a valid refresh token', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({ sub: 'user1', type: 'refresh' });
      mockRedisService.get.mockResolvedValue('refresh_token'); // Matches token

      const result = await service.validateRefreshToken('refresh_token');
      expect(result).toEqual({ sub: 'user1', type: 'refresh' });
    });

    it('should throw if token type is not refresh', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({ sub: 'user1', type: 'access' });
      await expect(service.validateRefreshToken('token')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw if token is not in redis', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({ sub: 'user1', type: 'refresh' });
      mockRedisService.get.mockResolvedValue(null);
      await expect(service.validateRefreshToken('token')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw and delete if token mismatch (reuse/hijack)', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({ sub: 'user1', type: 'refresh' });
      mockRedisService.get.mockResolvedValue('old_token');

      await expect(service.validateRefreshToken('new_token')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockRedisService.del).toHaveBeenCalledWith('refresh_token:user1');
    });
  });
});
