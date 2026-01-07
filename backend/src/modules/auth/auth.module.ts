import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from './strategies/google.strategy';
import { UsersModule } from '@/modules/users/users.module';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'google' }), UsersModule],
  controllers: [AuthController],
  providers: [GoogleStrategy],
})
export class AuthModule {}
