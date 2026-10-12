// THIRD PARTY IMPORTS
import { randomUUID } from 'crypto';
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { json } from 'express';
import helmet from 'helmet';

// INNER IMPORTS
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';

type RequestWithId = {
  headers: Record<string, string | string[] | undefined>;
  id?: string;
};

const REQUEST_ID_PATTERN = /^[A-Za-z0-9._-]{1,64}$/;

function requestIdFromHeader(value: string | string[] | undefined): string {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate && REQUEST_ID_PATTERN.test(candidate)
    ? candidate
    : randomUUID();
}

async function bootstrap() {
  const bootstrapLogger = new Logger('Bootstrap');
  try {
    const app = await NestFactory.create(AppModule, {
      bodyParser: false,
    });
    (app.getHttpAdapter().getInstance() as any).set('trust proxy', 1);
    const config = app.get(ConfigService);
    const isProduction = config.get('env') === 'production';

    app.use((request: RequestWithId, response: any, next: () => void) => {
      const requestId = requestIdFromHeader(request.headers['x-request-id']);
      request.id = requestId;
      response.setHeader('X-Request-Id', requestId);
      next();
    });
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
      exposedHeaders: ['X-Request-Id', 'X-RateLimit-Reset', 'Retry-After'],
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
    app.useGlobalFilters(new HttpExceptionFilter());

    const port = config.get<string>('server.port') || process.env.PORT || 3000;
    const host = config.get<string>('server.host') || '0.0.0.0';
    await app.listen(Number(port), host);
    bootstrapLogger.log(
      JSON.stringify({ event: 'server_started', host, port: Number(port) }),
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'unknown startup error';
    bootstrapLogger.error(
      JSON.stringify({ event: 'bootstrap_failed', message }),
    );
    process.exitCode = 1;
  }
}

bootstrap();

export { requestIdFromHeader };
