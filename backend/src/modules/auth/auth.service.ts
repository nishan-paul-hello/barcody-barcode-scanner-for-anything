import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { JwtAuthService } from './jwt-auth.service';
import { UsersService } from '@/modules/users/users.service';
import { firstValueFrom } from 'rxjs';
import { AuthResponseDto } from './dtos/auth-response.dto';
import { UserDto } from './dtos/user.dto';

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

      const { data: googleUser } = await firstValueFrom(
        this.httpService.get(tokenInfoUrl, {
          params: { id_token: token },
        }),
      );

      // Verify strict audience check if needed, but for now we trust the token if Google verifies it.
      // Ideally check if googleUser.aud === GOOGLE_CLIENT_ID

      const user = await this.usersService.findOrCreateByGoogleId({
        googleId: googleUser.sub, // 'sub' is the unique identifier in ID Token
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
    } catch (error) {
      this.logger.error(
        'Google authentication failed',
        error instanceof Error ? error.stack : error,
      );
      throw new UnauthorizedException('Google authentication failed');
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
