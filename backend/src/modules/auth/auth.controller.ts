import { Controller, Get, UseGuards, Req, Res, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { User } from '@/database/entities/user.entity';

interface RequestWithUser extends Request {
  user: User;
}

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
    // Guard initiates the Google OAuth flow
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req: RequestWithUser, @Res() res: Response) {
    const user = req.user;

    if (!user) {
      this.logger.error('Authentication failed, no user object found after callback');
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'Authentication failed',
      });
    }

    this.logger.log(`User successfully authenticated via Google: ${JSON.stringify(user)}`);

    // In Task 3.5 we will generate JWT. For now, we return the user or a success message.
    // The requirements say "Wait for Task 3.5 for JWT production".
    // For now, let's just return a placeholder or redirect if needed.
    // Usually, we redirect back to the frontend with tokens or set cookies.

    return res.status(HttpStatus.OK).json({
      message: 'User authenticated successfully',
      user,
    });
  }
}
