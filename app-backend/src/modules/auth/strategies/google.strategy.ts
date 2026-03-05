import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { UsersService } from '@/modules/users/users.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);

  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      clientID: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow<string>('GOOGLE_REDIRECT_URI'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    const { id, emails } = profile;
    const email = emails?.[0]?.value;

    if (!email) {
      this.logger.error('No email found in Google profile');
      return done(new Error('No email found'));
    }

    try {
      this.logger.log(`Validating Google user: ${email} (${id})`);
      const user = await this.usersService.findOrCreateByGoogleId({
        googleId: id,
        email,
      });

      done(undefined, user);
    } catch (error) {
      this.logger.error(`Error validating Google user: ${error}`);
      done(error as Error, undefined);
    }
  }
}
