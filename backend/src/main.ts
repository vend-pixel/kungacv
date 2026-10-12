// THIRD PARTY IMPORTS
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { json } from 'express';
import helmet from 'helmet';

// INNER IMPORTS
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });
  const config = app.get(ConfigService);
  const isProduction = config.get('env') === 'production';

  app.use(helmet({ contentSecurityPolicy: false }));

  const configuredOrigins = [
    config.get('client_url'),
    ...String(config.get('cors_extra_origins') || '').split(','),
  ];
  if (!isProduction) {
    configuredOrigins.push(
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
    );
  }
  const allowedOrigins = new Set(
    configuredOrigins
      .map((origin) => String(origin || '').trim())
      .filter(Boolean),
  );

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (error: Error | null, allow?: boolean) => void,
    ) => callback(null, !origin || allowedOrigins.has(origin)),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Signature',
      'X-Admin-Signup-Token',
      'X-Request-Id',
    ],
  });

  // Custom JSON parser keeps the untouched raw body around so the PayChangu
  // webhook can validate the HMAC-SHA256 `Signature` header (SECURITY.md).
  app.use(
    json({
      limit: '256kb',
      verify: (req: any, _res, buf) => {
        req.rawBody = buf;
      },
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = config.get<string>('server.port') || process.env.PORT || 3000;
  const host = config.get<string>('server.host') || '0.0.0.0';
  await app.listen(Number(port), host);
}
bootstrap();
