import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class UserThrottlerGuard extends ThrottlerGuard {
  protected override async getTracker(req: Record<string, unknown>): Promise<string> {
    // Use user ID if available (from JwtAuthGuard), otherwise fallback to IP
    const user = req.user as { id: string } | undefined;
    return user?.id || (req.ip as string);
  }
}
