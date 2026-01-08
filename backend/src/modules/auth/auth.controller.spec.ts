import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleAuthDto } from './dtos/google-auth.dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { AuthResponseDto } from './dtos/auth-response.dto';
import { UserDto } from './dtos/user.dto';
import { UnauthorizedException } from '@nestjs/common';
import { JwtPayload } from './jwt-auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

const mockJwtAuthGuard = {
  canActivate: jest.fn(() => true),
};

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    loginWithGoogle: jest.fn(),
    refreshToken: jest.fn(),
    logout: jest.fn(),
    getUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: JwtAuthGuard,
          useValue: mockJwtAuthGuard,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /auth/google', () => {
    it('should return tokens on successful Google authentication', async () => {
      const dto: GoogleAuthDto = { token: 'test-code' };
      const expectedResponse: AuthResponseDto = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: {
          id: 'user-id',
          email: 'test@example.com',
          createdAt: new Date(),
        },
      };

      mockAuthService.loginWithGoogle.mockResolvedValue(expectedResponse);

      const result = await controller.googleLogin(dto);

      expect(result).toEqual(expectedResponse);
      expect(authService.loginWithGoogle).toHaveBeenCalledWith(dto.token);
    });

    it('should throw UnauthorizedException on invalid code', async () => {
      const dto: GoogleAuthDto = { token: 'invalid-code' };

      mockAuthService.loginWithGoogle.mockRejectedValue(
        new UnauthorizedException('Google authentication failed'),
      );

      await expect(controller.googleLogin(dto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('POST /auth/refresh', () => {
    it('should return new tokens on valid refresh token', async () => {
      const dto: RefreshTokenDto = { refreshToken: 'valid-refresh-token' };
      const expectedResponse: AuthResponseDto = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        user: {
          id: 'user-id',
          email: 'test@example.com',
          createdAt: new Date(),
        },
      };

      mockAuthService.refreshToken.mockResolvedValue(expectedResponse);

      const result = await controller.refresh(dto);

      expect(result).toEqual(expectedResponse);
      expect(authService.refreshToken).toHaveBeenCalledWith(dto.refreshToken);
    });

    it('should throw UnauthorizedException on invalid refresh token', async () => {
      const dto: RefreshTokenDto = { refreshToken: 'invalid-token' };

      mockAuthService.refreshToken.mockRejectedValue(
        new UnauthorizedException('Invalid refresh token'),
      );

      await expect(controller.refresh(dto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('POST /auth/logout', () => {
    it('should invalidate refresh token', async () => {
      const mockRequest = {
        user: { sub: 'user-id', email: 'test@example.com' } as JwtPayload,
      } as any;

      mockAuthService.logout.mockResolvedValue(undefined);

      await controller.logout(mockRequest);

      expect(authService.logout).toHaveBeenCalledWith('user-id');
    });
  });

  describe('GET /auth/me', () => {
    it('should return current user profile', async () => {
      const mockRequest = {
        user: { sub: 'user-id', email: 'test@example.com' } as JwtPayload,
      } as any;

      const expectedUser: UserDto = {
        id: 'user-id',
        email: 'test@example.com',
        createdAt: new Date(),
      };

      mockAuthService.getUser.mockResolvedValue(expectedUser);

      const result = await controller.getMe(mockRequest);

      expect(result).toEqual(expectedUser);
      expect(authService.getUser).toHaveBeenCalledWith('user-id');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const mockRequest = {
        user: { sub: 'user-id', email: 'test@example.com' } as JwtPayload,
      } as any;

      mockAuthService.getUser.mockRejectedValue(new UnauthorizedException('User not found'));

      await expect(controller.getMe(mockRequest)).rejects.toThrow(UnauthorizedException);
    });
  });
});
