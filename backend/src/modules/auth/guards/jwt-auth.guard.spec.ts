import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtAuthService } from '../jwt-auth.service';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtAuthService: JwtAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: JwtAuthService,
          useValue: {
            validateAccessToken: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    jwtAuthService = module.get<JwtAuthService>(JwtAuthService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true if token is valid', async () => {
    const payload = { sub: 'user-id', userId: 'user-id', email: 'test@example.com' };
    (jwtAuthService.validateAccessToken as jest.Mock).mockResolvedValue(payload);

    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            authorization: 'Bearer valid-token',
          },
        }),
      }),
    } as unknown as ExecutionContext;

    expect(await guard.canActivate(context)).toBe(true);
  });

  it('should throw UnauthorizedException if no token provided', async () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {},
        }),
      }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if token is invalid', async () => {
    (jwtAuthService.validateAccessToken as jest.Mock).mockRejectedValue(new Error());

    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            authorization: 'Bearer invalid-token',
          },
        }),
      }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });
});
