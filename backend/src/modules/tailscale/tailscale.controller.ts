import { Controller, Get, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TailscaleService } from './tailscale.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';

@Controller('setup')
export class TailscaleController {
  constructor(
    private readonly tailscaleService: TailscaleService,
    private readonly configService: ConfigService,
  ) {}

  @Get('tailscale-info')
  @UseGuards(JwtAuthGuard)
  async getTailscaleInfo() {
    const ip = await this.tailscaleService.detectTailscaleIp();
    const port = this.configService.get<number>('PORT', 8000);

    return {
      ip,
      port,
      url: ip ? `http://${ip}:${port}` : null,
      isConnected: !!ip,
    };
  }
}
