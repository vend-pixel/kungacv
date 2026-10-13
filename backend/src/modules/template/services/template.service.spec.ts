import { BadRequestException, ConflictException } from '@nestjs/common';
import { TemplateService } from './template.service';

describe('TemplateService', () => {
  const templateModel = {
    create: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    countDocuments: jest.fn(),
    find: jest.fn(),
  };
  const subscriptionModel = { countDocuments: jest.fn() };
  const cloudinaryService = {
    uploadPreview: jest.fn(),
    deletePreview: jest.fn(),
  };
  let service: TemplateService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TemplateService(
      templateModel as any,
      subscriptionModel as any,
      cloudinaryService as any,
    );
  });

  it('normalizes slugs and creates unpublished drafts', async () => {
    templateModel.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue(null),
    });
    subscriptionModel.countDocuments.mockResolvedValue(0);
    templateModel.create.mockResolvedValue({
      uid: 'tpl_1',
      slug: 'classic-blue',
      published: false,
    });

    const result = await service.create(
      { name: 'Classic Blue', slug: 'Classic Blue', config: {} },
      'admin_1',
    );

    expect(templateModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: 'classic-blue',
        published: false,
        createdBy: 'admin_1',
      }),
    );
    expect(result.uid).toBe('tpl_1');
  });

  it('rejects duplicate slugs', async () => {
    templateModel.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue({ uid: 'existing' }),
    });
    await expect(
      service.create(
        { name: 'Classic', slug: 'classic', config: {} },
        'admin_1',
      ),
    ).rejects.toThrow(ConflictException);
  });

  it('requires active packages before publishing a paid template', async () => {
    const template = {
      uid: 'tpl_1',
      access: 'paid',
      packageUids: ['pkg_1'],
      config: {},
      previewUrl: 'https://example.com/preview.webp',
      save: jest.fn(),
    };
    templateModel.findOne.mockResolvedValue(template);
    subscriptionModel.countDocuments.mockResolvedValue(0);
    await expect(service.publish('tpl_1', 'admin_1')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('rolls back a newly uploaded preview if Mongo persistence fails', async () => {
    const template = {
      uid: 'tpl_1',
      version: 1,
      previewPublicId: 'old_public_id',
      save: jest.fn().mockRejectedValue(new Error('database unavailable')),
    };
    templateModel.findOne.mockResolvedValue(template);
    cloudinaryService.uploadPreview.mockResolvedValue({
      secureUrl: 'https://cloudinary.example/new.webp',
      publicId: 'new_public_id',
    });
    cloudinaryService.deletePreview.mockResolvedValue(undefined);

    await expect(
      service.uploadPreview('tpl_1', {
        buffer: Buffer.from('x'),
        mimetype: 'image/png',
        size: 1,
      }),
    ).rejects.toThrow('database unavailable');
    expect(cloudinaryService.deletePreview).toHaveBeenCalledWith(
      'new_public_id',
    );
  });
});
