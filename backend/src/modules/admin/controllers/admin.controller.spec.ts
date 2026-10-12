// THIRD PARTY IMPORTS
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';

// INNER IMPORTS
import { AdminController } from './admin.controller';

describe('AdminController', () => {
  const authService = {
    signIn: jest.fn(),
    signUp: jest.fn(),
  };
  const adminService = {
    getParsedQuery: jest.fn(),
    updateUser: jest.fn(),
  };
  const userService = {
    getAllUsers: jest.fn(),
  };
  const makeConfig = (token?: string) =>
    ({
      get: jest.fn((key: string) =>
        key === 'admin_signup_token' ? token : undefined,
      ),
    }) as any;

  const build = (token?: string) =>
    new AdminController(
      authService as any,
      adminService as any,
      userService as any,
      makeConfig(token),
    );

  let controller: AdminController;

  const adminReq = {
    user: { uid: 'a1', role: 'admin', email: 'admin@example.org' },
  } as any;
  const userReq = {
    user: { uid: 'u1', role: 'user', email: 'jane@example.org' },
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = build('s3cret-token');
  });

  describe('POST /admin/signup (env-token gated)', () => {
    const payload = {
      name: 'Ops',
      email: 'ops@example.org',
      password: 'secret',
    } as any;

    it('rejects when ADMIN_SIGNUP_TOKEN is not configured', async () => {
      controller = build(undefined);

      await expect(controller.signUp(payload)).rejects.toThrow(
        ForbiddenException,
      );
      expect(authService.signUp).not.toHaveBeenCalled();
    });

    it('rejects a missing header token', async () => {
      await expect(controller.signUp(payload)).rejects.toThrow(
        ForbiddenException,
      );
      expect(authService.signUp).not.toHaveBeenCalled();
    });

    it('rejects a wrong header token', async () => {
      await expect(controller.signUp(payload, 'wrong-token')).rejects.toThrow(
        ForbiddenException,
      );
      expect(authService.signUp).not.toHaveBeenCalled();
    });

    it('creates an admin when the token matches', async () => {
      authService.signUp.mockResolvedValue({
        access_token: 't',
        user: { role: 'admin' },
      });

      const result = await controller.signUp(payload, 's3cret-token');

      expect(authService.signUp).toHaveBeenCalledWith(payload, 'admin');
      expect(result.access_token).toBe('t');
    });
  });

  describe('POST /admin/create-user', () => {
    it('rejects a non-admin caller before touching the service', async () => {
      await expect(
        controller.createUser(
          { name: 'X', email: 'x@example.org' } as any,
          userReq,
        ),
      ).rejects.toThrow(UnauthorizedException);
      expect(authService.signUp).not.toHaveBeenCalled();
    });

    it('creates a plain user as admin', async () => {
      authService.signUp.mockResolvedValue({ user: { role: 'user' } });

      await controller.createUser(
        { name: 'X', email: 'x@example.org', password: 'pw' } as any,
        adminReq,
      );

      expect(authService.signUp).toHaveBeenCalledWith(
        expect.any(Object),
        'user',
      );
    });

    it("honours an explicit role:'admin' when the caller is admin", async () => {
      authService.signUp.mockResolvedValue({ user: { role: 'admin' } });

      await controller.createUser(
        { name: 'Y', email: 'y@example.org', role: 'admin' } as any,
        adminReq,
      );

      expect(authService.signUp).toHaveBeenCalledWith(
        expect.any(Object),
        'admin',
      );
    });
  });

  describe('GET /admin/get-users', () => {
    it('rejects a non-admin caller (PII dump protection)', async () => {
      await expect(
        controller.getUsers({} as any, userReq, null),
      ).rejects.toThrow(UnauthorizedException);
      expect(userService.getAllUsers).not.toHaveBeenCalled();
    });

    it('returns users to an admin', async () => {
      adminService.getParsedQuery.mockReturnValue({});
      userService.getAllUsers.mockResolvedValue([{ uid: 'u1' }]);

      const result = await controller.getUsers(
        { count: 'true' } as any,
        adminReq,
        null,
      );

      expect(result).toEqual({ users: [{ uid: 'u1' }], count: 1 });
      expect(userService.getAllUsers).toHaveBeenCalledWith({});
    });

    it('scopes to a single user when :userId is present', async () => {
      adminService.getParsedQuery.mockReturnValue({});

      await controller.getUsers({} as any, adminReq, 'u7');

      expect(userService.getAllUsers).toHaveBeenCalledWith({ uid: ['u7'] });
    });
  });

  describe('PATCH /admin/update-user/:userId', () => {
    it('rejects a non-admin caller', async () => {
      await expect(
        controller.updateUser({ name: 'Hax' } as any, 'u7', userReq),
      ).rejects.toThrow(UnauthorizedException);
      expect(adminService.updateUser).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /admin/delete-user/:userId', () => {
    it('rejects a non-admin caller', async () => {
      await expect(controller.deleteUser('u7', userReq)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(adminService.updateUser).not.toHaveBeenCalled();
    });

    it('soft-deletes with actor uid as admin', async () => {
      adminService.updateUser.mockResolvedValue({ uid: 'u7', active: false });

      await controller.deleteUser('u7', adminReq);

      expect(adminService.updateUser).toHaveBeenCalledWith(
        'u7',
        expect.objectContaining({ active: false, deleted_by: 'a1' }),
      );
    });
  });
});
