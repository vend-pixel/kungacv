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

  app.use(helmet({ contentSecurityPolicy: false }));

  const allowedOrigins = new Set(
    [
      config.get('client_url'),
      ...String(config.get('cors_extra_origins') || '').split(','),
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
    ]
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
    ],
  });

  // Custom JSON parser keeps the untouched raw body around so the PayChangu
  // webhook can validate the HMAC-SHA256 `Signature` header (SECURITY.md).
  app.use(
    json({
      verify: (req: any, _res, buf) => {
        req.rawBody = buf;
      },
    }),
  );

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  const port = config.get<string>('server.port') || process.env.PORT || 3000;
  const host = config.get<string>('server.host') || '0.0.0.0';
  await app.listen(Number(port), host);
}
bootstrap();
