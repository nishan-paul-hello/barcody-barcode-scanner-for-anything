import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { CreateEventDto } from './dto/create-event.dto';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('event')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Track an analytics event' })
  @ApiResponse({ status: 200, description: 'Event queued successfully' })
  async trackEvent(@Body() createEventDto: CreateEventDto) {
    // Process asynchronously, don't wait for queue result if not needed,
    // but service.trackEvent is async to await queue.add, which is fast.
    await this.analyticsService.trackEvent(createEventDto);
    return { success: true, message: 'Event queued for processing' };
  }
}
