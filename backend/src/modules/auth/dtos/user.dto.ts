import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({ description: 'Unique identifier of the user' })
  id!: string;

  @ApiProperty({ description: 'Email address of the user' })
  email!: string;

  @ApiProperty({ description: 'Date when the user account was created' })
  createdAt!: Date;

  @ApiProperty({ description: 'Display name of the user', required: false })
  name?: string;

  @ApiProperty({ description: 'Profile picture URL of the user', required: false })
  picture?: string;
}
