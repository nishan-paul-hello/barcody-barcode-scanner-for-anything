import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '@modules/redis/redis.service';

export interface JwtPayload {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
  type?: 'access' | 'refresh';
}

@Injectable()
export class JwtAuthService {
  private readonly logger = new Logger(JwtAuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  async generateAccessToken(
    userId: string,
    email: string,
    name?: string,
    picture?: string,
  ): Promise<string> {
    const payload: JwtPayload = { sub: userId, email, name, picture, type: 'access' };
    return this.jwtService.signAsync(payload, {
      expiresIn: '15m',
      secret: this.configService.get<string>('JWT_SECRET'),
    });
  }

  async generateRefreshToken(
    userId: string,
    email: string,
    name?: string,
    picture?: string,
  ): Promise<string> {
    const payload: JwtPayload = { sub: userId, email, name, picture, type: 'refresh' };
    const token = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
      secret: this.configService.get<string>('JWT_SECRET'),
    });

    // Store in Redis with 7 day TTL
    const redisKey = this.redisService.createKey('refresh_token', userId);
    await this.redisService.set(redisKey, token, 7 * 24 * 60 * 60);

    return token;
  }

  async generateTokens(userId: string, email: string, name?: string, picture?: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(userId, email, name, picture),
      this.generateRefreshToken(userId, email, name, picture),
    ]);
    return { accessToken, refreshToken };
  }

  async validateAccessToken(token: string): Promise<JwtPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      return payload;
    } catch (_error) {
      throw new UnauthorizedException('Invalid access token');
    }
  }

  async validateRefreshToken(token: string): Promise<JwtPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      const userId = payload.sub;
      const redisKey = this.redisService.createKey('refresh_token', userId);
      const storedToken = await this.redisService.get<string>(redisKey);

      if (!storedToken) {
        throw new UnauthorizedException('Refresh token expired or revoked');
      }

      if (storedToken !== token) {
        this.logger.warn(`Refresh token mismatch for user ${userId}`);
        // Potential token reuse detected - clear connection
        await this.redisService.del(redisKey);
        throw new UnauthorizedException('Invalid refresh token');
      }

      return payload;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async removeRefreshToken(userId: string): Promise<void> {
    const redisKey = this.redisService.createKey('refresh_token', userId);
    await this.redisService.del(redisKey);
  }
}
