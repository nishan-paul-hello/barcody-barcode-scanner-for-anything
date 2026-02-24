import { IsEnum, IsNotEmpty, IsOptional, IsString, IsObject, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BarcodeType } from '@common/enums/barcode-type.enum';
import { DeviceType } from '@common/enums/device-type.enum';

export class CreateScanDto {
  @ApiProperty({ description: 'The barcode data', example: '1234567890123' })
  @IsString()
  @IsNotEmpty()
  barcodeData!: string;

  @ApiProperty({
    enum: BarcodeType,
    description: 'Type of the barcode',
    example: BarcodeType.EAN13,
  })
  @IsEnum(BarcodeType)
  barcodeType!: BarcodeType;

  @ApiProperty({
    description: 'Raw data from the scanner',
    example: '1234567890123',
  })
  @IsString()
  @IsNotEmpty()
  rawData!: string;

  @ApiProperty({
    enum: DeviceType,
    description: 'Device used for scanning',
    example: DeviceType.WEB,
  })
  @IsEnum(DeviceType)
  deviceType!: DeviceType;

  @ApiPropertyOptional({
    description: 'Timestamp when the scan occurred',
    example: '2023-01-01T12:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  scannedAt?: string;

  @ApiPropertyOptional({ description: 'The product name', example: 'Chocolate Milk' })
  @IsOptional()
  @IsString()
  productName?: string;

  @ApiPropertyOptional({ description: 'The product brand', example: 'Nestle' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ description: 'The product category', example: 'Beverages' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'The product image URL',
    example: 'https://example.com/image.jpg',
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'The nutrition grade', example: 'A' })
  @IsOptional()
  @IsString()
  nutritionGrade?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: { location: 'New York', accuracy: 0.95 },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
