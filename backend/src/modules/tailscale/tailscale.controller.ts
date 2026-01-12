import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TailscaleService } from './tailscale.service';

@Controller('setup')
export class TailscaleController {
  constructor(
    private readonly tailscaleService: TailscaleService,
    private readonly configService: ConfigService,
  ) {}

  @Get('tailscale-info')
  async getTailscaleInfo() {
    const ip = await this.tailscaleService.detectTailscaleIp();
    const port = this.configService.get<number>('PORT', 8000);
    const hostname = this.configService.get<string>('TAILSCALE_HOSTNAME', 'barcody-backend');

    if (!ip) {
      throw new Error(
        'Tailscale is not configured. Please install Tailscale and connect to your network.',
      );
    }

    return {
      ip,
      hostname,
      backendUrl: `http://${ip}:${port}`,
      magicDNS: `${hostname}.ts.net`,
      nodeName: hostname,
    };
  }
}
