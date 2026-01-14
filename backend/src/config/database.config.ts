import { ConfigService } from '@nestjs/config';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  url: configService.get<string>('DATABASE_URL'),
  entities: [`${__dirname}/../**/*.entity{.ts,.js}`],
  migrations: [`${__dirname}/../database/migrations/*{.ts,.js}`],
  synchronize: configService.get<string>('NODE_ENV') === 'development', // Always false for production-ready, use migrations
  logging: configService.get<string>('NODE_ENV') === 'development',
  extra: {
    max: 50,
    min: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
});
