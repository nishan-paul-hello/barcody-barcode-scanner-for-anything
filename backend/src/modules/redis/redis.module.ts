import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';
import { RedisService } from './redis.service';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        store: redisStore,
        url: configService.get<string>('REDIS_URL') || configService.get<string>('redis.url'),
        ttl: configService.get<number>('redis.ttl'),
        // Connection pooling settings (ioredis options)
        max: configService.get<number>('redis.max'),
        // Handle connection errors gracefully
        retryStrategy: (times: number) => Math.min(times * 50, 2000),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [RedisService],

  exports: [RedisService, CacheModule],
})
export class RedisModule {}
