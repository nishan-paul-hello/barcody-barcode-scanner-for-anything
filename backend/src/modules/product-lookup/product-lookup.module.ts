import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ProductLookupService } from '@modules/product-lookup/product-lookup.service';
import { ProductsController } from '@modules/product-lookup/products.controller';
import { RedisModule } from '@modules/redis/redis.module';
import { AuthModule } from '@modules/auth/auth.module';
import { UsersModule } from '@modules/users/users.module';
import { UserThrottlerGuard } from '@/common/guards/user-throttler.guard';

import { ProductComparisonService } from '@modules/product-lookup/comparison.service';

@Module({
  imports: [
    ConfigModule,
    RedisModule,
    AuthModule,
    UsersModule,
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
    ProductComparisonService,
    {
      provide: ThrottlerGuard,
      useClass: UserThrottlerGuard,
    },
  ],
  exports: [ProductLookupService, ProductComparisonService],
})
export class ProductLookupModule {}
