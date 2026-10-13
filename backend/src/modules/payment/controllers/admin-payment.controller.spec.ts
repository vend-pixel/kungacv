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
    await expect(
      controller.get('kunga_1', { user: { role: 'user' } } as any),
    ).rejects.toThrow(ForbiddenException);
    expect(service.listAdmin).not.toHaveBeenCalled();
    expect(service.findAdmin).not.toHaveBeenCalled();
  });

  it('returns the payment list envelope for admins', async () => {
    service.listAdmin.mockResolvedValue({
      payments: [{ tx_ref: 'kunga_1', status: 'success' }],
      count: 1,
    });
    const controller = new AdminPaymentController(service as any);
    const query = { page: 1, perPage: 25, status: 'success' };
    await expect(
      controller.list(query as any, { user: { role: 'admin' } } as any),
    ).resolves.toEqual({
      payments: [{ tx_ref: 'kunga_1', status: 'success' }],
      count: 1,
    });
    expect(service.listAdmin).toHaveBeenCalledWith(query);
  });

  it('returns the payment detail envelope for admins', async () => {
    service.findAdmin.mockResolvedValue({ tx_ref: 'kunga_1', status: 'success' });
    const controller = new AdminPaymentController(service as any);
    await expect(
      controller.get('kunga_1', { user: { role: 'admin' } } as any),
    ).resolves.toEqual({
      payment: { tx_ref: 'kunga_1', status: 'success' },
    });
    expect(service.findAdmin).toHaveBeenCalledWith('kunga_1');
  });
});
