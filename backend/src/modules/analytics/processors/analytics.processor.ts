import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalyticsEvent } from '../entities/analytics-event.entity';

@Processor('analytics')
export class AnalyticsProcessor {
  private readonly logger = new Logger(AnalyticsProcessor.name);

  constructor(
    @InjectRepository(AnalyticsEvent)
    private readonly analyticsRepository: Repository<AnalyticsEvent>,
  ) {}

  @Process('track_event')
  async handleTrackEvent(job: Job) {
    const eventData = job.data;
    this.logger.debug(`Processing event: ${eventData.event_type} for user ${eventData.user_id}`);

    try {
      const event = this.analyticsRepository.create({
        event_type: eventData.event_type,
        user_id: eventData.user_id,
        metadata: eventData.metadata,
        timestamp: new Date(eventData.timestamp),
      });

      await this.analyticsRepository.save(event);

      this.logger.debug(`Event saved to local database successfully`);
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = error as any;
      this.logger.error(`Failed to save event to database: ${err.message}`);
      throw error;
    }
  }
}
