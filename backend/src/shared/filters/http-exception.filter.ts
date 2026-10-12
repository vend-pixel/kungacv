import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

type RequestWithId = Request & { id?: string };

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const request = http.getRequest<RequestWithId>();
    const response = http.getResponse<Response>();
    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;
    const requestId = request.id || 'unknown';
    const error = this.getErrorResponse(exception, status);
    const event = {
      event: 'http_request_failed',
      requestId,
      method: request.method,
      path: request.originalUrl || request.url,
      status,
    };

    if (status >= 500) {
      const stack = exception instanceof Error ? exception.stack : undefined;
      this.logger.error(JSON.stringify(event), stack);
    } else {
      this.logger.warn(JSON.stringify(event));
    }

    response.status(status).json({
      statusCode: status,
      message: error,
      requestId,
    });
  }

  private getErrorResponse(exception: unknown, status: number) {
    if (status >= 500) return 'internal server error';
    if (!(exception instanceof HttpException)) return 'request failed';

    const payload = exception.getResponse();
    if (typeof payload === 'string') return payload;
    if (payload && typeof payload === 'object' && 'message' in payload) {
      return (payload as { message: unknown }).message;
    }
    return 'request failed';
  }
}
