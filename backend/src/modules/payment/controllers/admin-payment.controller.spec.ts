import { ForbiddenException } from '@nestjs/common';
import { AdminPaymentController } from './admin-payment.controller';

describe('AdminPaymentController', () => {
  const service = { listAdmin: jest.fn(), findAdmin: jest.fn() };

  beforeEach(() => jest.clearAllMocks());

  it('rejects non-admin payment queries', async () => {
    const controller = new AdminPaymentController(service as any);
    await expect(
      controller.list({} as any, { user: { role: 'user' } } as any),
    ).rejects.toThrow(ForbiddenException);
    expect(service.listAdmin).not.toHaveBeenCalled();
  });

  it('returns the payment detail envelope for admins', async () => {
    service.findAdmin.mockResolvedValue({ id: 'kunga_1', status: 'success' });
    const controller = new AdminPaymentController(service as any);
    await expect(
      controller.get('kunga_1', { user: { role: 'admin' } } as any),
    ).resolves.toEqual({
      payment: { id: 'kunga_1', status: 'success' },
    });
  });
});
