import { ValidationPipe, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

import { AppModule } from '@/app.module';
import { HttpExceptionFilter } from '@/common/filters/http-exception.filter';
import { LoggingInterceptor } from '@/common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  app.setGlobalPrefix('api/v1');

  // Enable CORS
  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Allow localhost
      if (!origin || origin.startsWith('http://localhost:')) {
        return callback(null, true);
      }

      // Parse the origin URL
      const url = new URL(origin);
      const hostname = url.hostname;

      // Allow Tailscale MagicDNS hostnames (*.ts.net)
      if (hostname.endsWith('.ts.net')) {
        return callback(null, true);
      }

      // Allow Tailscale IPs (100.64.0.0/10)
      // Range: 100.64.0.0 - 100.127.255.255
      if (hostname.startsWith('100.')) {
        // Simple prefix check for 100.x.x.x which covers the Class A-ish block
        // For more precision we could parse the IP parts
        const parts = hostname.split('.').map(Number);
        if (parts[0] === 100 && parts[1] !== undefined && parts[1] >= 64 && parts[1] <= 127) {
          return callback(null, true);
        }
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
  // 100.64.0.0/10 is the Tailscale range
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', (ip: string) => {
    // Trust localhost
    if (ip === '127.0.0.1' || ip === '::1') return true;

    // Trust Tailscale IPs
    if (ip.startsWith('100.')) {
      const parts = ip.split('.').map(Number);
      return parts[0] === 100 && parts[1] !== undefined && parts[1] >= 64 && parts[1] <= 127;
    }

    return false;
  });

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
  await app.listen(process.env.PORT ?? 8000, '0.0.0.0');
}
void bootstrap();
