// THIRD PARTY IMPORTS
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

// INNER IMPORTS
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  const jwtService = new JwtService({ secret: 'test-secret' });
  const configService = {
    get: jest.fn().mockReturnValue('test-secret'),
  } as any;
  let guard: AuthGuard;

  const makeContext = (authorization?: string) => {
    const req: any = { headers: {} };
    if (authorization) req.headers.authorization = authorization;

    return {
      switchToHttp: () => ({ getRequest: () => req }),
      req,
    } as any;
  };

  beforeEach(() => {
    guard = new AuthGuard(jwtService, configService);
  });

  it('rejects a request with no Authorization header', async () => {
    const context = makeContext();

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
    expect(context.req.user).toBeUndefined();
  });

  it('rejects a garbage token', async () => {
    const context = makeContext('Bearer not-a-jwt');

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
    expect(context.req.user).toBeUndefined();
  });

  it('rejects a token signed with a different secret', async () => {
    const foreign = new JwtService({ secret: 'other-secret' });
    const token = await foreign.signAsync({ uid: 'u1', role: 'user' });
    const context = makeContext(`Bearer ${token}`);

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('does not expose JWT verification details in the error response', async () => {
    const context = makeContext('Bearer not-a-jwt');

    try {
      await guard.canActivate(context);
      fail('expected authorization to fail');
    } catch (error) {
      expect((error as UnauthorizedException).getResponse()).toEqual({
        message: 'invalid or expired token',
      });
    }
  });

  it('accepts a valid token and attaches the payload to req.user', async () => {
    const token = await jwtService.signAsync({
      uid: 'u1',
      email: 'jane@example.org',
      name: 'Jane',
      role: 'user',
      active: true,
    });
    const context = makeContext(`Bearer ${token}`);

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(context.req.user).toMatchObject({
      uid: 'u1',
      email: 'jane@example.org',
      role: 'user',
      active: true,
    });
  });

  it('reads the secret from config service when jwtService has no secret', async () => {
    const bareGuard = new AuthGuard(new JwtService(), configService);
    const token = await jwtService.signAsync({ uid: 'u2', role: 'admin' });
    const context = makeContext(`Bearer ${token}`);

    await expect(bareGuard.canActivate(context)).resolves.toBe(true);
    expect(context.req.user.role).toBe('admin');
  });
});
