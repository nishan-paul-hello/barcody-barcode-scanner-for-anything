import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsProcessor } from './processors/analytics.processor';
import { AnalyticsEvent } from './entities/analytics-event.entity';
import { UsageStats } from './entities/usage-stats.entity';
import { ScanMetrics } from './entities/scan-metrics.entity';
import { ErrorStats } from './entities/error-stats.entity';
import { UserBehavior } from './entities/user-behavior.entity';
import { DeviceStats } from './entities/device-stats.entity';
import { ApiMetrics } from './entities/api-metrics.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      AnalyticsEvent,
      UsageStats,
      ScanMetrics,
      ErrorStats,
      UserBehavior,
      DeviceStats,
      ApiMetrics,
    ]),
    BullModule.registerQueue({
      name: 'analytics',
    }),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, AnalyticsProcessor],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
