import { ApiProperty } from '@nestjs/swagger';

export class AnalyticsOverviewDto {
  @ApiProperty()
  totalScans!: number;

  @ApiProperty()
  totalUsers!: number;

  @ApiProperty()
  activeToday!: number;
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
