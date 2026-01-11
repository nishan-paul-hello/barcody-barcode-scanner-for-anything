import { IsArray, ValidateNested, ArrayMaxSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateScanDto } from './create-scan.dto';

export class BulkCreateScansDto {
  @ApiProperty({ type: [CreateScanDto], description: 'Array of scans to create' })
  @IsArray()
  @ArrayMaxSize(1000)
  @ValidateNested({ each: true })
  @Type(() => CreateScanDto)
  scans!: CreateScanDto[];
}
