import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Injectable()
export class TailscaleService implements OnModuleInit {
  private readonly logger = new Logger(TailscaleService.name);
  private tailscaleIp: string | null = null;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.detectTailscaleIp();
  }

  async detectTailscaleIp(): Promise<string | null> {
    if (this.tailscaleIp) {
      return this.tailscaleIp;
    }

    try {
      this.logger.log('Attempting to auto-detect Tailscale IP...');
      const { stdout } = await execAsync('tailscale ip -4');
      const ip = stdout.trim();

      if (ip) {
        this.logger.log(`Tailscale IP auto-detected: ${ip}`);
        this.tailscaleIp = ip;
        return ip;
      }
    } catch (error) {
      this.logger.warn(
        `Failed to auto-detect Tailscale IP: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }

    // Fallback to environment variable
    const envIp = this.configService.get<string>('TAILSCALE_IP');
    if (envIp) {
      this.logger.log(`Using fallback TAILSCALE_IP from environment: ${envIp}`);
      this.tailscaleIp = envIp;
      return envIp;
    }

    this.logger.warn('No Tailscale IP detected or configured.');
    return null;
  }

  getIp(): string | null {
    return this.tailscaleIp;
  }
}
