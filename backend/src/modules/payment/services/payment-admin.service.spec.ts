import { BadRequestException } from '@nestjs/common';
import { PaymentService } from './payment.service';

describe('PaymentService admin queries', () => {
  const paymentModel = {
    find: jest.fn(),
    findOne: jest.fn(),
    countDocuments: jest.fn(),
  };
  let service: PaymentService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PaymentService(
      paymentModel as any,
      {} as any,
      {} as any,
      {} as any,
      { get: jest.fn() } as any,
    );
  });

  it('uses only allowlisted filters and omits checkout URLs from admin output', async () => {
    const chain = {
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([
        {
          tx_ref: 'kunga_1',
          user_uid: 'user_1',
          user_email: 'user@example.com',
          plan: 'pro',
          amount: 5000,
          currency: 'MWK',
          status: 'success',
          checkout_url: 'https://provider.example/secret-session',
        },
      ]),
    };
    paymentModel.find.mockReturnValue(chain);
    paymentModel.countDocuments.mockResolvedValue(1);
    const result = await service.listAdmin({
      page: 1,
      perPage: 25,
      status: 'success',
      userUid: 'user_1',
      sort: 'createdAt',
      order: 'desc',
      ignoredMongoOperator: { $where: 'true' },
    } as any);
    expect(paymentModel.find).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'success', user_uid: 'user_1' }),
    );
    expect(result.payments[0]).toEqual(
      expect.objectContaining({ tx_ref: 'kunga_1' }),
    );
    expect(result.payments[0]).not.toHaveProperty('checkout_url');
  });

  it('rejects an inverted date range', async () => {
    await expect(
      service.listAdmin({
        page: 1,
        perPage: 25,
        from: '2026-02-01T00:00:00.000Z',
        to: '2026-01-01T00:00:00.000Z',
      } as any),
    ).rejects.toThrow(BadRequestException);
  });
});
