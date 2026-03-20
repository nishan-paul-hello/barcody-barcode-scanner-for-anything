import { ValidationPipe, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Request, Response, NextFunction } from 'express';

import { AppModule } from '@/app.module';
import { HttpExceptionFilter } from '@common/filters/http-exception.filter';
import { LoggingInterceptor } from '@common/interceptors/logging.interceptor';

function isAllowedOrigin(origin: string): boolean {
  const url = new URL(origin);
  const hostname = url.hostname;

  if (hostname.endsWith('.kaiofficial.xyz') || hostname === 'kaiofficial.xyz') {
    return true;
  }

  if (hostname.endsWith('.ts.net')) {
    return true;
  }

  if (hostname.startsWith('100.')) {
    const parts = hostname.split('.').map(Number);
    if (parts[0] === 100 && parts[1] !== undefined && parts[1] >= 64 && parts[1] <= 127) {
      return true;
    }
  }

  return false;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  app.setGlobalPrefix('api/v1');

  // Fix Cross-Origin-Opener-Policy for Google Login
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.header('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  });

  // Enable CORS
  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin || origin.startsWith('http://localhost:') || isAllowedOrigin(origin)) {
        return callback(null, true);
      }
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
    allowedHeaders: 'Authorization,Content-Type,Accept',
    exposedHeaders: 'Content-Length,Content-Type',
  });

  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Trust proxy for correct IP detection behind Tailscale/Docker
  const expressApp = app.getHttpAdapter().getInstance();

  const isTailscaleIp = (parts: number[]): boolean =>
    parts[0] === 100 && (parts[1] ?? 0) >= 64 && (parts[1] ?? 0) <= 127;

  const isDockerIp = (parts: number[]): boolean =>
    parts[0] === 172 && (parts[1] ?? 0) >= 16 && (parts[1] ?? 0) <= 31;

  const isTrustedProxy = (ip: string): boolean => {
    if (ip === '127.0.0.1' || ip === '::1') return true;
    const parts = ip.split('.').map(Number);
    if (ip.startsWith('100.')) return isTailscaleIp(parts);
    if (ip.startsWith('172.')) return isDockerIp(parts);
    return false;
  };

  expressApp.set('trust proxy', isTrustedProxy);

  // Swagger Configuration
  logger.log(`Current NODE_ENV: ${process.env.NODE_ENV}`);
  if (process.env.NODE_ENV !== 'production') {
    logger.log('Initializing Swagger for development...');
    const { DocumentBuilder, SwaggerModule } = await import('@nestjs/swagger');
    const config = new DocumentBuilder()
      .setTitle('Barcody API')
      .setDescription('The Barcody Barcode Scanner API documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    logger.log('Swagger setup complete at /api/docs');
  }

  // Bind to all interfaces for Tailscale access
  await app.listen(process.env.PORT as string, '0.0.0.0');
}
void bootstrap();
