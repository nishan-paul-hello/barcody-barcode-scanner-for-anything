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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
