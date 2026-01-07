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

  async loginWithGoogle(code: string): Promise<AuthResponseDto> {
    try {
      this.logger.log('Exchanging Google code for tokens');
      const tokenUrl = 'https://oauth2.googleapis.com/token';
      const { data: tokenData } = await firstValueFrom(
        this.httpService.post(tokenUrl, {
          code,
          client_id: this.configService.get('GOOGLE_CLIENT_ID'),
          client_secret: this.configService.get('GOOGLE_CLIENT_SECRET'),
          redirect_uri: this.configService.get('GOOGLE_REDIRECT_URI'),
          grant_type: 'authorization_code',
        }),
      );

      this.logger.log('Fetching Google user info');
      const userInfoUrl = 'https://www.googleapis.com/oauth2/v2/userinfo';
      const { data: googleUser } = await firstValueFrom(
        this.httpService.get(userInfoUrl, {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        }),
      );

      const user = await this.usersService.findOrCreateByGoogleId({
        googleId: googleUser.id,
        email: googleUser.email,
      });

      const tokens = await this.jwtAuthService.generateTokens(user.id, user.email);

      return {
        ...tokens,
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.createdAt,
        },
      };
    } catch (error) {
      this.logger.error(`Google authentication failed: ${error}`);
      throw new UnauthorizedException('Google authentication failed');
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    const payload = await this.jwtAuthService.validateRefreshToken(refreshToken);
    const user = await this.usersService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const tokens = await this.jwtAuthService.generateTokens(user.id, user.email);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      },
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
