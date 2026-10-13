import { ForbiddenException } from '@nestjs/common';
import { AdminPricingController } from './admin-pricing.controller';

describe('AdminPricingController', () => {
  const service = {
    listAdmin: jest.fn(),
    findAdmin: jest.fn(),
    createAdmin: jest.fn(),
    updateAdmin: jest.fn(),
    setActive: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it('rejects non-admin requests before calling the service', async () => {
    const controller = new AdminPricingController(service as any);
    await expect(
      controller.list({} as any, { user: { role: 'user' } } as any),
    ).rejects.toThrow(ForbiddenException);
    expect(service.listAdmin).not.toHaveBeenCalled();
  });

  it('wraps an admin create response for React Admin', async () => {
    service.createAdmin.mockResolvedValue({ uid: 'pkg_1' });
    const controller = new AdminPricingController(service as any);
    await expect(
      controller.create(
        { name: 'Pro', duration: 30 } as any,
        { user: { role: 'admin', uid: 'admin_1' } } as any,
      ),
    ).resolves.toEqual({ subscription: { uid: 'pkg_1' } });
    expect(service.createAdmin).toHaveBeenCalledWith(
      { name: 'Pro', duration: 30 },
      'admin_1',
    );
  });

  it('delegates pricing reads, updates, lifecycle, and soft delete', async () => {
    const controller = new AdminPricingController(service as any);
    const request = { user: { role: 'admin', uid: 'admin_1' } } as any;
    service.listAdmin.mockResolvedValue({ subscriptions: [], count: 0 });
    service.findAdmin.mockResolvedValue({ uid: 'pkg_1' });
    service.updateAdmin.mockResolvedValue({ uid: 'pkg_1' });
    service.setActive.mockResolvedValue({ uid: 'pkg_1' });
    service.softDelete.mockResolvedValue({ uid: 'pkg_1' });

    await expect(controller.list({ page: 2 } as any, request)).resolves.toEqual(
      {
        subscriptions: [],
        count: 0,
      },
    );
    await expect(controller.get('pkg_1', request)).resolves.toEqual({
      subscription: { uid: 'pkg_1' },
    });
    await expect(
      controller.update('pkg_1', { name: 'Updated' } as any, request),
    ).resolves.toEqual({
      subscription: { uid: 'pkg_1' },
    });
    await expect(controller.activate('pkg_1', request)).resolves.toEqual({
      subscription: { uid: 'pkg_1' },
    });
    await expect(controller.disable('pkg_1', request)).resolves.toEqual({
      subscription: { uid: 'pkg_1' },
    });
    await expect(controller.remove('pkg_1', request)).resolves.toEqual({
      subscription: { uid: 'pkg_1' },
    });

    expect(service.listAdmin).toHaveBeenCalledWith({ page: 2 });
    expect(service.findAdmin).toHaveBeenCalledWith('pkg_1');
    expect(service.updateAdmin).toHaveBeenCalledWith(
      'pkg_1',
      { name: 'Updated' },
      'admin_1',
    );
    expect(service.setActive).toHaveBeenNthCalledWith(
      1,
      'pkg_1',
      true,
      'admin_1',
    );
    expect(service.setActive).toHaveBeenNthCalledWith(
      2,
      'pkg_1',
      false,
      'admin_1',
    );
    expect(service.softDelete).toHaveBeenCalledWith('pkg_1', 'admin_1');
  });
});
