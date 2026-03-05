import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/database/entities/user.entity';
import { UsersService } from '@/modules/users/users.service';
import { UsersController } from '@/modules/users/users.controller';
import { AuthModule } from '@/modules/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), forwardRef(() => AuthModule)],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
