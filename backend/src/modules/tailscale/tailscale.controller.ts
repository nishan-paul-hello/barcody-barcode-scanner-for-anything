import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller('setup')
export class TailscaleController {
  constructor(private readonly configService: ConfigService) {}

  @Get('tailscale-info')
  async getTailscaleInfo() {
    const hostname = this.configService.get<string>('TAILSCALE_HOSTNAME', 'api-barcody');

    // For professional sidecars, the domain is usually hostname.tailnet.ts.net
    const tailnet = 'tamarin-ph';
    const magicDNS = hostname.includes('.')
      ? `${hostname}.ts.net`
      : `${hostname}.${tailnet}.ts.net`;
    const backendUrl = `https://${magicDNS}/api/v1`;

    return {
      hostname,
      backendUrl,
      magicDNS,
      nodeName: hostname,
    };
  }
}
