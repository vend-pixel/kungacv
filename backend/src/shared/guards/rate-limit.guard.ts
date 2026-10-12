import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import { RATE_LIMIT_METADATA, RateLimitOptions } from './rate-limit.decorator';

type Bucket = {
  count: number;
  resetAt: number;
};

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly buckets = new Map<string, Bucket>();
  private readonly maxBuckets = 10_000;

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const options = this.reflector.getAllAndOverride<RateLimitOptions>(
      RATE_LIMIT_METADATA,
      [context.getHandler(), context.getClass()],
    );
    if (!options) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const now = Date.now();
    const key = `${options.name}:${request.ip || request.socket.remoteAddress || 'unknown'}`;
    const existing = this.buckets.get(key);
    const bucket =
      !existing || existing.resetAt <= now
        ? { count: 0, resetAt: now + options.windowMs }
        : existing;

    if (this.buckets.size >= this.maxBuckets && !existing) {
      this.removeExpired(now);
      if (this.buckets.size >= this.maxBuckets) {
        const oldestKey = this.buckets.keys().next().value;
        if (oldestKey) this.buckets.delete(oldestKey);
      }
    }

    bucket.count += 1;
    this.buckets.set(key, bucket);
    this.setHeaders(response, options, bucket, now);

    if (bucket.count > options.limit) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((bucket.resetAt - now) / 1000),
      );
      response.setHeader('Retry-After', retryAfterSeconds);
      throw new HttpException(
        {
          message: 'too many requests',
          retryAfterSeconds,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  private setHeaders(
    response: Response,
    options: RateLimitOptions,
    bucket: Bucket,
    now: number,
  ) {
    response.setHeader('X-RateLimit-Limit', options.limit);
    response.setHeader(
      'X-RateLimit-Remaining',
      Math.max(0, options.limit - bucket.count),
    );
    response.setHeader('X-RateLimit-Reset', Math.ceil(bucket.resetAt / 1000));
    response.setHeader(
      'RateLimit-Policy',
      `${options.limit};w=${Math.ceil(options.windowMs / 1000)}`,
    );
    response.setHeader('Date', new Date(now).toUTCString());
  }

  private removeExpired(now: number) {
    for (const [key, bucket] of this.buckets) {
      if (bucket.resetAt <= now) this.buckets.delete(key);
    }
  }
}
