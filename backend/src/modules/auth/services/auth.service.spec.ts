// THIRD PARTY IMPORTS
import { UnauthorizedException } from '@nestjs/common';

// INNER IMPORTS
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const userService = {
    createUser: jest.fn(),
    findOne: jest.fn(),
    updateUser: jest.fn(),
    normalizeEmail: jest.fn((email: string) => email.trim().toLowerCase()),
    toPublicUser: jest.fn((user: any) => {
      if (!user) return user;
      const publicUser = { ...user };
      delete publicUser.password;
      delete publicUser.deleted_at;
      delete publicUser.deleted_by;
      return publicUser;
    }),
  };
  const jwtService = { signAsync: jest.fn().mockResolvedValue('signed-token') };
  let service: AuthService;

  const regularUser = { role: 'user', email: 'jane@example.org', uid: 'u1' };
  const adminUser = { role: 'admin', email: 'admin@example.org', uid: 'a1' };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(userService as any, jwtService as any);
    userService.updateUser.mockResolvedValue({ uid: 'u1', name: 'Updated' });
  });

  describe('updateUserProfile privilege guards', () => {
    it("rejects a non-admin trying to set role to 'admin'", async () => {
      await expect(
        service.updateUserProfile({ role: 'admin' } as any, regularUser),
      ).rejects.toThrow(UnauthorizedException);
      expect(userService.updateUser).not.toHaveBeenCalled();
    });

    it('rejects active:true from a non-admin', async () => {
      await expect(
        service.updateUserProfile({ active: true } as any, regularUser),
      ).rejects.toThrow(UnauthorizedException);
      expect(userService.updateUser).not.toHaveBeenCalled();
    });

    it('rejects active:false from a non-admin (falsy bypass regression)', async () => {
      await expect(
        service.updateUserProfile({ active: false } as any, regularUser),
      ).rejects.toThrow(UnauthorizedException);
      expect(userService.updateUser).not.toHaveBeenCalled();
    });

    it('rejects deleted_at from a non-admin', async () => {
      await expect(
        service.updateUserProfile(
          { deleted_at: new Date() } as any,
          regularUser,
        ),
      ).rejects.toThrow(UnauthorizedException);
      expect(userService.updateUser).not.toHaveBeenCalled();
    });

    it('rejects deleted_by from a non-admin', async () => {
      await expect(
        service.updateUserProfile(
          { deleted_by: 'someone' } as any,
          regularUser,
        ),
      ).rejects.toThrow(UnauthorizedException);
      expect(userService.updateUser).not.toHaveBeenCalled();
    });

    it('allows a plain profile update from a non-admin', async () => {
      const result = await service.updateUserProfile(
        { name: 'Jane B.' } as any,
        regularUser,
      );

      expect(userService.updateUser).toHaveBeenCalledWith(
        { name: 'Jane B.' },
        { email: 'jane@example.org', uid: 'u1' },
      );
      expect(result).toEqual({ uid: 'u1', name: 'Updated' });
    });

    it('allows an admin to update role', async () => {
      await service.updateUserProfile(
        { role: 'admin', active: false } as any,
        adminUser,
      );

      expect(userService.updateUser).toHaveBeenCalledWith(
        { role: 'admin', active: false },
        { email: 'admin@example.org', uid: 'a1' },
      );
    });
  });

  describe('signUp', () => {
    it("forces role to 'user' even if the payload asks for admin (signup endpoint)", async () => {
      userService.createUser.mockResolvedValue({
        email: 'evil@example.org',
        name: 'Evil',
        uid: 'u9',
        role: 'user',
      });

      await service.signUp({
        name: 'Evil',
        email: 'evil@example.org',
        password: 'secret',
        role: 'admin',
      } as any);

      expect(userService.createUser).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'user' }),
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'user' }),
      );
    });

    it('keeps the explicitly passed role when signUp is called by an admin flow', async () => {
      userService.createUser.mockResolvedValue({
        email: 'ops@example.org',
        name: 'Ops',
        uid: 'u10',
        role: 'admin',
      });

      await service.signUp(
        { name: 'Ops', email: 'ops@example.org', password: 'secret' } as any,
        'admin',
      );

      expect(userService.createUser).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'admin' }),
      );
    });
  });

  describe('signIn', () => {
    it('queries by the requested role so a user token never matches an admin', async () => {
      userService.findOne.mockResolvedValue(null);

      await expect(
        service.signIn({ email: 'jane@example.org', password: 'secret' }),
      ).rejects.toThrow(UnauthorizedException);
      expect(userService.findOne).toHaveBeenCalledWith({
        email: 'jane@example.org',
        role: 'user',
        active: true,
      });
    });

    it('normalizes email before lookup', async () => {
      userService.findOne.mockResolvedValue(null);
      await expect(
        service.signIn({ email: '  JANE@EXAMPLE.ORG ', password: 'secret' }),
      ).rejects.toThrow(UnauthorizedException);
      expect(userService.findOne).toHaveBeenCalledWith({
        email: 'jane@example.org',
        role: 'user',
        active: true,
      });
    });
  });

  it('redacts private fields from a public profile', async () => {
    userService.findOne.mockResolvedValue({
      uid: 'u1',
      email: 'jane@example.org',
      password: 'hash',
      deleted_at: null,
      deleted_by: null,
      name: 'Jane',
    });
    const profile = await service.getPublicProfile('jane@example.org');
    expect(profile).toEqual({
      uid: 'u1',
      email: 'jane@example.org',
      name: 'Jane',
    });
  });
});
