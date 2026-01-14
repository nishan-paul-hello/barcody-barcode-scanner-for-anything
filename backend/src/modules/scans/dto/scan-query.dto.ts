import { IsEnum, IsInt, IsOptional, IsString, Min, Max, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BarcodeType } from '@common/enums/barcode-type.enum';
import { DeviceType } from '@common/enums/device-type.enum';

export class ScanQueryDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 50;

  @ApiPropertyOptional({ description: 'Search by barcode data' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: BarcodeType, description: 'Filter by barcode type' })
  @IsOptional()
  @IsEnum(BarcodeType)
  barcodeType?: BarcodeType;

  @ApiPropertyOptional({ enum: DeviceType, description: 'Filter by device type' })
  @IsOptional()
  @IsEnum(DeviceType)
  deviceType?: DeviceType;

  @ApiPropertyOptional({ description: 'Filter by start date' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Filter by end date' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Filter by category' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Filter by nutrition grade', example: 'A' })
  @IsOptional()
  @IsString()
  nutritionGrade?: string;

  @ApiPropertyOptional({ description: 'Sort field', default: 'scannedAt' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'scannedAt';

  @ApiPropertyOptional({ description: 'Sort order', default: 'DESC' })
  @IsOptional()
  @IsString()
  order?: 'ASC' | 'DESC' = 'DESC';
}
