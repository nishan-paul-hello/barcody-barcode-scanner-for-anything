import { ApiProperty } from '@nestjs/swagger';
import { User } from '@/database/entities/user.entity';
import { Scan } from '@/database/entities/scan.entity';

export class UserListDto {
  @ApiProperty({ type: [User] })
  items!: User[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  totalPages!: number;
}

export class ScanListDto {
  @ApiProperty({ type: [Scan] })
  items!: Scan[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  totalPages!: number;
}
