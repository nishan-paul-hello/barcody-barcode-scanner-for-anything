import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from '@modules/auth/dtos/user.dto';

export class AuthResponseDto {
  @ApiProperty({ description: 'JWT access token' })
  accessToken!: string;

  @ApiProperty({ description: 'JWT refresh token' })
  refreshToken!: string;

  @ApiProperty({ type: UserDto, description: 'Authenticated user details' })
  user!: UserDto;

  @ApiProperty({ description: 'True if user is an admin' })
  isAdmin!: boolean;
}
