import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProductLookupService } from './product-lookup.service';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [ConfigModule, RedisModule],
  providers: [ProductLookupService],
  exports: [ProductLookupService],
})
export class ProductLookupModule {}
