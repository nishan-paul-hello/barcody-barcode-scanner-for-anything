import { IsString, IsNotEmpty, IsOptional, IsObject, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum AnalyticsEventType {
  SCAN_CREATED = 'scan_created',
  SCAN_DELETED = 'scan_deleted',
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  EXPORT_GENERATED = 'export_generated',
  ERROR_OCCURRED = 'error_occurred',
  PAGE_VIEW = 'page_view',
  SCREEN_VIEW = 'screen_view',
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
