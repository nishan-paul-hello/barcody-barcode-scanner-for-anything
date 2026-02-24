import { ApiProperty } from '@nestjs/swagger';

export class AnalyticsOverviewDto {
  @ApiProperty()
  totalScans!: number;

  @ApiProperty()
  totalUsers!: number;

  @ApiProperty()
  activeToday!: number;

  @ApiProperty({ description: 'Scan growth % vs previous equal-length period', nullable: true })
  scanGrowthPercent!: number | null;

  @ApiProperty({ description: 'User growth % vs previous equal-length period', nullable: true })
  userGrowthPercent!: number | null;

  @ApiProperty({
    description: 'Scan success rate: scans with identified barcode type / total scans',
  })
  successRate!: number;
}

export class TrendDataPointDto {
  @ApiProperty()
  date!: string;

  @ApiProperty()
  count!: number;
}

export class TrendDataDto {
  @ApiProperty({ type: [TrendDataPointDto] })
  data!: TrendDataPointDto[];
}

export class BarcodeTypeDistributionDto {
  @ApiProperty()
  type!: string;

  @ApiProperty()
  count!: number;
}

export class DeviceDistributionDto {
  @ApiProperty()
  device!: string;

  @ApiProperty()
  count!: number;
}

export class RetentionCohortWeekDto {
  @ApiProperty({ description: 'Week start date (ISO string)' })
  weekStart!: string;

  @ApiProperty({ description: 'Number of unique users who first scanned this week' })
  newUsers!: number;

  @ApiProperty({ description: 'Retention percentages for weeks 0..N (week 0 is always 100%)' })
  retention!: number[];
}

export class RetentionCohortsDto {
  @ApiProperty({ type: [RetentionCohortWeekDto] })
  cohorts!: RetentionCohortWeekDto[];
}

export class TopBarcodeDto {
  @ApiProperty()
  barcodeData!: string;

  @ApiProperty()
  barcodeType!: string;

  @ApiProperty()
  count!: number;

  @ApiProperty({ nullable: true })
  productName!: string | null;
}

export class HourlyActivityDto {
  @ApiProperty({ description: 'Hour of day 0–23' })
  hour!: number;

  @ApiProperty()
  count!: number;
}
