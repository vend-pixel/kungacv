import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RateLimit } from './rate-limit.decorator';
import { RateLimitGuard } from './rate-limit.guard';

class TestController {
  @RateLimit({ name: 'test', limit: 1, windowMs: 60_000 })
  limited() {
    return true;
  }
}

describe('RateLimitGuard', () => {
  const handler = TestController.prototype.limited;

  const makeContext = (ip: string) => {
    const response = { setHeader: jest.fn() };
    const request = { ip, socket: { remoteAddress: ip } };
    return {
      context: {
        getHandler: () => handler,
        getClass: () => TestController,
        switchToHttp: () => ({
          getRequest: () => request,
          getResponse: () => response,
        }),
      } as unknown as ExecutionContext,
      response,
    };
  };

  it('allows the configured quota and publishes rate-limit headers', () => {
    const guard = new RateLimitGuard(new Reflector());
    const { context, response } = makeContext('10.0.0.1');

    expect(guard.canActivate(context)).toBe(true);
    expect(response.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 1);
    expect(response.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', 0);
  });

  it('rejects requests over quota with a retry hint', () => {
    const guard = new RateLimitGuard(new Reflector());
    const first = makeContext('10.0.0.2');
    const second = makeContext('10.0.0.2');

    expect(guard.canActivate(first.context)).toBe(true);
    expect(() => guard.canActivate(second.context)).toThrow(
      'too many requests',
    );
    expect(second.response.setHeader).toHaveBeenCalledWith('Retry-After', 60);
  });

  it('keeps separate client buckets', () => {
    const guard = new RateLimitGuard(new Reflector());

    expect(guard.canActivate(makeContext('10.0.0.3').context)).toBe(true);
    expect(guard.canActivate(makeContext('10.0.0.4').context)).toBe(true);
  });
});
