import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleAuthDto {
  @ApiProperty({
    description: 'Authorization code from Google OAuth',
    example: '4/0AeaYSH...',
  })
  @IsString()
  @IsNotEmpty()
  token!: string;
}
