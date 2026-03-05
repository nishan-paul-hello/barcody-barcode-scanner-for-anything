import { IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BulkDeleteScansDto {
  @ApiProperty({ description: 'Array of scan IDs to delete', type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  ids!: string[];
}
