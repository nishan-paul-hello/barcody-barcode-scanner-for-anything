import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Scan } from '@database/entities/scan.entity';
import { AuthModule } from '@/modules/auth/auth.module';
import { ScansService } from './scans.service';
import { ScansController } from './scans.controller';
import { ScansGateway } from './scans.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Scan]), AuthModule],
  controllers: [ScansController],
  providers: [ScansService, ScansGateway],
  exports: [ScansService],
})
export class ScansModule {}
