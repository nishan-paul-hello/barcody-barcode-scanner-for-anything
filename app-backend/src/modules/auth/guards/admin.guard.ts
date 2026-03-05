import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');

    if (!user || user.email !== adminEmail) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
