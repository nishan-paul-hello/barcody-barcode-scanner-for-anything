import { IsArray, ArrayMinSize, ArrayMaxSize, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CompareProductsDto {
  @ApiProperty({
    description: 'Array of barcodes to compare',
    example: ['5449000000996', '5000112637937'],
    minItems: 2,
    maxItems: 5,
  })
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(5)
  @IsString({ each: true })
  barcodes!: string[];
}
