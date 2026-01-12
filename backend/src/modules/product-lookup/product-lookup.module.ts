import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ProductLookupService } from './product-lookup.service';
import { ProductsController } from './products.controller';
import { RedisModule } from '../redis/redis.module';
import { AuthModule } from '../auth/auth.module';
import { UserThrottlerGuard } from '@/common/guards/user-throttler.guard';

@Module({
  imports: [
    ConfigModule,
    RedisModule,
    AuthModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
  ],
  controllers: [ProductsController],
  providers: [
    ProductLookupService,
    {
      provide: ThrottlerGuard,
      useClass: UserThrottlerGuard,
    },
  ],
  exports: [ProductLookupService],
})
export class ProductLookupModule {}
