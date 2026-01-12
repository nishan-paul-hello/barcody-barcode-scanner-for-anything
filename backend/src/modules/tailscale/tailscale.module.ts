import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@/modules/auth/auth.module';
import { TailscaleController } from './tailscale.controller';
import { TailscaleService } from './tailscale.service';

@Module({
  imports: [ConfigModule, AuthModule],
  controllers: [TailscaleController],
  providers: [TailscaleService],
  exports: [TailscaleService],
})
export class TailscaleModule {}
