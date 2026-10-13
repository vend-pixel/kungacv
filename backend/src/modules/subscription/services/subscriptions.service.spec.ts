import { ConflictException } from '@nestjs/common';
import { SubscriptionService } from './subscriptions.service';

describe('SubscriptionService admin operations', () => {
  const model = {
    create: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    countDocuments: jest.fn(),
    find: jest.fn(),
  };
  let service: SubscriptionService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SubscriptionService(model as any);
  });

  it('normalizes package slugs and preserves admin ownership', async () => {
    model.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
    model.create.mockResolvedValue({ uid: 'pkg_1', slug: 'pro-monthly' });
    await service.createAdmin(
      { name: 'Pro Monthly', slug: 'Pro Monthly', duration: 30 },
      'admin_1',
    );
    expect(model.create).toHaveBeenCalledWith(
      expect.objectContaining({ slug: 'pro-monthly', created_by: 'admin_1' }),
    );
  });

  it('rejects duplicate package slugs', async () => {
    model.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue({ uid: 'pkg_old' }),
    });
    await expect(
      service.createAdmin(
        { name: 'Pro', slug: 'pro', duration: 30 },
        'admin_1',
      ),
    ).rejects.toThrow(ConflictException);
  });

  it('returns bounded admin lists with an allowlisted sort field', async () => {
    const chain = {
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([{ uid: 'pkg_1' }]),
    };
    model.find.mockReturnValue(chain);
    model.countDocuments.mockResolvedValue(1);
    const result = await service.listAdmin({
      page: 2,
      perPage: 10,
      sort: 'name',
      order: 'desc',
    } as any);
    expect(chain.sort).toHaveBeenCalledWith({ name: -1, _id: 1 });
    expect(chain.skip).toHaveBeenCalledWith(10);
    expect(result).toEqual(
      expect.objectContaining({ subscriptions: [{ uid: 'pkg_1' }], count: 1 }),
    );
  });
});
