import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Res,
  HttpStatus,
  HttpCode,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { GoogleAuthDto } from './dtos/google-auth.dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { AuthResponseDto } from './dtos/auth-response.dto';
import { UserDto } from './dtos/user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtPayload } from './jwt-auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('google')
  @ApiOperation({ summary: 'Exchange Google OAuth code for JWT tokens' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tokens generated successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid code' })
  @HttpCode(HttpStatus.OK)
  async googleLogin(@Body() dto: GoogleAuthDto): Promise<AuthResponseDto> {
    return this.authService.loginWithGoogle(dto.code);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'New tokens generated',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid refresh token',
  })
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshTokenDto): Promise<AuthResponseDto> {
    return this.authService.refreshToken(dto.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Invalidate refresh token' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Logged out successfully' })
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request): Promise<void> {
    const user = req['user'] as JwtPayload;
    await this.authService.logout(user.sub);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User profile',
    type: UserDto,
  })
  async getProfile(@Req() req: Request): Promise<UserDto> {
    const user = req['user'] as JwtPayload;
    return this.authService.getUser(user.sub);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Initiate Google OAuth flow (Web Redirect)' })
  async googleAuthRedirectInitiate() {
    // Guard initiates the Google OAuth flow
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google OAuth Callback (Web Redirect)' })
  async googleAuthRedirectCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user;

    if (!user) {
      this.logger.error('Authentication failed, no user object found');
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'Authentication failed',
      });
    }

    return res.status(HttpStatus.OK).json({
      message: 'Authenticated',
      user,
    });
  }
}
