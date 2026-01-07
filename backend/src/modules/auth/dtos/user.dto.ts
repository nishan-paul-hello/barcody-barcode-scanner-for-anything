import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({ description: 'Unique identifier of the user' })
  id!: string;

  @ApiProperty({ description: 'Email address of the user' })
  email!: string;

  @ApiProperty({ description: 'Date when the user account was created' })
  createdAt!: Date;
}
