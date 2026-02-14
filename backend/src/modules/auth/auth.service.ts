import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { JwtAuthService } from '@modules/auth/jwt-auth.service';
import { UsersService } from '@modules/users/users.service';
import { firstValueFrom } from 'rxjs';
import { AuthResponseDto } from '@modules/auth/dtos/auth-response.dto';
import { UserDto } from '@modules/auth/dtos/user.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly jwtAuthService: JwtAuthService,
  ) {}

  async loginWithGoogle(token: string): Promise<AuthResponseDto> {
    try {
      this.logger.log('Verifying Google ID Token');
      const tokenInfoUrl = `https://oauth2.googleapis.com/tokeninfo`;

      const response = await firstValueFrom(
        this.httpService.get(tokenInfoUrl, {
          params: { id_token: token },
        }),
      );

      const googleUser = response.data;
      this.logger.debug(`Google user verified: ${googleUser.email}`);

      // Verify strict audience check
      const expectedClientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
      if (googleUser.aud !== expectedClientId) {
        this.logger.error(`Audience mismatch: expected ${expectedClientId}, got ${googleUser.aud}`);
        throw new UnauthorizedException('Google authentication failed: audience mismatch');
      }

      const user = await this.usersService.findOrCreateByGoogleId({
        googleId: googleUser.sub,
        email: googleUser.email,
      });

      const tokens = await this.jwtAuthService.generateTokens(
        user.id,
        user.email,
        googleUser.name,
        googleUser.picture,
      );

      const isAdmin = user.email === this.configService.get<string>('ADMIN_EMAIL');

      return {
        ...tokens,
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.createdAt,
          name: googleUser.name,
          picture: googleUser.picture,
        },
        isAdmin,
      };
    } catch (error: any) {
      if (error.response?.data) {
        this.logger.error('Google verification failed with response:', error.response.data);
      }
      this.logger.error(
        'Google authentication failed',
        error instanceof Error ? error.stack : error,
      );
      throw new UnauthorizedException(
        error.response?.data?.error_description || 'Google authentication failed',
      );
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    const payload = await this.jwtAuthService.validateRefreshToken(refreshToken);
    const user = await this.usersService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const tokens = await this.jwtAuthService.generateTokens(
      user.id,
      user.email,
      payload.name,
      payload.picture,
    );

    const isAdmin = user.email === this.configService.get<string>('ADMIN_EMAIL');

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        name: payload.name,
        picture: payload.picture,
      },
      isAdmin,
    };
  }

  async logout(userId: string): Promise<void> {
    await this.jwtAuthService.removeRefreshToken(userId);
  }

  async getUser(userId: string): Promise<UserDto> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}
