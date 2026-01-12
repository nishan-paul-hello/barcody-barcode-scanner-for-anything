import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { AuthController } from '@modules/auth/auth.controller';
import { GoogleStrategy } from '@modules/auth/strategies/google.strategy';
import { UsersModule } from '@modules/users/users.module';
import { RedisModule } from '@modules/redis/redis.module';
import { JwtAuthService } from '@modules/auth/jwt-auth.service';
import { AuthService } from '@modules/auth/auth.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'google' }),
    UsersModule,
    RedisModule,
    HttpModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [GoogleStrategy, JwtAuthService, AuthService],
  exports: [JwtAuthService, JwtModule, AuthService],
})
export class AuthModule {}
