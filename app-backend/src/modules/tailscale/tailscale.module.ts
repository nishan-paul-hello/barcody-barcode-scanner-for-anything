import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@modules/auth/auth.module';
import { TailscaleController } from '@modules/tailscale/tailscale.controller';

@Module({
  imports: [ConfigModule, AuthModule],
  controllers: [TailscaleController],
  providers: [],
  exports: [],
})
export class TailscaleModule {}
