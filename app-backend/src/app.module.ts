import { join } from 'path';

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinstonModule } from 'nest-winston';

import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { getDatabaseConfig } from '@config/database.config';
import { envSchema } from '@config/env.schema';
import { winstonConfig } from '@config/winston.config';
import { HealthModule } from '@modules/health/health.module';
import { RedisModule } from '@modules/redis/redis.module';
import { AuthModule } from '@modules/auth/auth.module';
import { UsersModule } from '@modules/users/users.module';
import { ScansModule } from '@modules/scans/scans.module';
import { TailscaleModule } from '@modules/tailscale/tailscale.module';
import { ProductLookupModule } from '@modules/product-lookup/product-lookup.module';
import { ExportModule } from '@modules/export/export.module';
import { AdminModule } from '@modules/admin/admin.module';
import { BullModule } from '@nestjs/bull';
import { AnalyticsModule } from '@modules/analytics/analytics.module';
import redisConfig from '@config/redis.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV || 'development'}`, '.env'],
      load: [redisConfig],
      validationSchema: envSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    WinstonModule.forRoot(winstonConfig),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
    RedisModule,
    HealthModule,
    UsersModule,
    AuthModule,
    ScansModule,
    TailscaleModule,
    ProductLookupModule,
    ExportModule,
    AdminModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.getOrThrow<string>('redis.url');
        const url = new URL(redisUrl);
        return {
          redis: {
            host: url.hostname,
            port: parseInt(url.port),
            password: url.password || undefined,
            username: url.username || undefined,
            db: url.pathname ? parseInt(url.pathname.substring(1)) : undefined,
          },
        };
      },
      inject: [ConfigService],
    }),
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
