// THIRD PARTY IMPORTS
import { BadRequestException, ValidationPipe } from '@nestjs/common';

// INNER IMPORTS
import { CreateUserDto, LoginUserDto, UpdateUserDto } from './user.dto';

describe('user DTOs under ValidationPipe(whitelist)', () => {
  const pipe = new ValidationPipe({ whitelist: true });

  const transform = (
    payload: Record<string, unknown>,
    metatype: any = CreateUserDto,
  ) => pipe.transform(payload, { type: 'body', metatype });

  it('strips unknown fields such as isPro / proExpiresAt / plan', async () => {
    const out = await transform({
      name: 'Jane Banda',
      email: 'jane@example.org',
      password: 'secret',
      role: 'user',
      isPro: true,
      proExpiresAt: new Date(),
      plan: 'pro',
    });

    expect(out.isPro).toBeUndefined();
    expect(out.proExpiresAt).toBeUndefined();
    expect(out.plan).toBeUndefined();
    expect(out.role).toBe('user');
    expect(out.email).toBe('jane@example.org');
  });

  it('rejects a role outside the admin/user enum', async () => {
    await expect(
      transform({
        name: 'X',
        email: 'x@example.org',
        password: 'secret',
        role: 'superadmin',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('accepts the admin role (admin creation path)', async () => {
    const out = await transform({
      name: 'Admin',
      email: 'admin@example.org',
      password: 'secret',
      role: 'admin',
    });

    expect(out.role).toBe('admin');
  });

  it('UpdateUserDto keeps optional sensitive keys typed but still whitelisted', async () => {
    const out = await transform(
      { active: false, deleted_by: 'adm1' },
      UpdateUserDto,
    );

    expect(out.active).toBe(false);
    expect(out.deleted_by).toBe('adm1');

    const stripped = await transform({ isAdmin: true }, UpdateUserDto);
    expect(stripped.isAdmin).toBeUndefined();
  });

  it('requires an email on login', async () => {
    await expect(
      transform({ password: 'secret' }, LoginUserDto),
    ).rejects.toThrow(BadRequestException);
  });
});
