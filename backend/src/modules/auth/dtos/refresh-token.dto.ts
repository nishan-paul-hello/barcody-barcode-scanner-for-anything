import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token to obtain new access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR...',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}
