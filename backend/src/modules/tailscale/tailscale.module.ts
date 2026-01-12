import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@modules/auth/auth.module';
import { TailscaleController } from '@modules/tailscale/tailscale.controller';
import { TailscaleService } from '@modules/tailscale/tailscale.service';

@Module({
  imports: [ConfigModule, AuthModule],
  controllers: [TailscaleController],
  providers: [TailscaleService],
  exports: [TailscaleService],
})
export class TailscaleModule {}
