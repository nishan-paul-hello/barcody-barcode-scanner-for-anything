import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BarcodeType } from '@common/enums/barcode-type.enum';
import { DeviceType } from '@common/enums/device-type.enum';

export class ExportQueryDto {
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

  @ApiPropertyOptional({ description: 'Sort field', default: 'scannedAt' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'scannedAt';

  @ApiPropertyOptional({ description: 'Sort order', default: 'DESC' })
  @IsOptional()
  @IsString()
  order?: 'ASC' | 'DESC' = 'DESC';
}
