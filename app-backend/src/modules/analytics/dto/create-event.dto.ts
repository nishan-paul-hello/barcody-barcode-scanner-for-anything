import { IsString, IsNotEmpty, IsOptional, IsObject, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum AnalyticsEventType {
  PAGE_VIEW = 'page_view',
  SCAN_CREATED = 'scan_created',
  SCAN_FAILED = 'scan_failed',
  SCAN_DELETED = 'scan_deleted',
  SEARCH_PERFORMED = 'search_performed',
  FILTER_APPLIED = 'filter_applied',
  EXPORT_GENERATED = 'export_generated',
  SETTINGS_CHANGED = 'settings_changed',
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  ERROR_OCCURRED = 'error_occurred',
}

export class CreateEventDto {
  @ApiProperty({ enum: AnalyticsEventType })
  @IsEnum(AnalyticsEventType)
  event_type!: AnalyticsEventType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  user_id!: string;

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  timestamp?: string;
}
