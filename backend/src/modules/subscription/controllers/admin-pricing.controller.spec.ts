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
  });
});
