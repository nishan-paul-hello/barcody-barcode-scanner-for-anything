import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import * as crypto from 'crypto';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);
  private readonly hashSecret: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectQueue('analytics') private readonly analyticsQueue: Queue,
  ) {
    this.hashSecret = this.configService.getOrThrow<string>('ANALYTICS_HASH_SECRET');
  }

  async trackEvent(createEventDto: CreateEventDto): Promise<void> {
    const hashedUserId = this.hashUserId(createEventDto.user_id);
    const event = {
      ...createEventDto,
      user_id: hashedUserId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      timestamp: (createEventDto as any).timestamp || new Date().toISOString(),
    };

    try {
      await this.analyticsQueue.add('track_event', event, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: true,
      });
      this.logger.debug(`Event queued: ${event.event_type} for user ${hashedUserId}`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      this.logger.error(`Failed to queue event: ${error.message}`, error.stack);
      // Fail silently to not impact main application flow
    }
  }

  private hashUserId(userId: string): string {
    return crypto
      .createHash('sha256')
      .update(userId + this.hashSecret)
      .digest('hex');
  }
}
