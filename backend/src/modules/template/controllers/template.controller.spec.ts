import { ForbiddenException } from '@nestjs/common';
import {
  AdminTemplateController,
  TemplateController,
} from './template.controller';

describe('TemplateController', () => {
  const templateService = {
    listPublic: jest.fn(),
    findPublicByUid: jest.fn(),
    findPublicBySlug: jest.fn(),
    listAdmin: jest.fn(),
    findAdmin: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    uploadPreview: jest.fn(),
    publish: jest.fn(),
    disable: jest.fn(),
    restore: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it('wraps public template lists in the provider response envelope', async () => {
    templateService.listPublic.mockResolvedValue({
      data: [{ uid: 'tpl_1' }],
      total: 1,
    });
    const controller = new TemplateController(templateService as any);
    await expect(
      controller.list({ page: 1, perPage: 25 } as any),
    ).resolves.toEqual({
      templates: [{ uid: 'tpl_1' }],
      count: 1,
    });
  });

  it('rejects non-admin template reads', async () => {
    const controller = new AdminTemplateController(templateService as any);
    await expect(
      controller.list({} as any, { user: { role: 'user' } } as any),
    ).rejects.toThrow(ForbiddenException);
    expect(templateService.listAdmin).not.toHaveBeenCalled();
  });

  it('creates templates using the authenticated admin UID', async () => {
    templateService.create.mockResolvedValue({ uid: 'tpl_1' });
    const controller = new AdminTemplateController(templateService as any);
    const result = await controller.create(
      { name: 'Classic', slug: 'classic', config: {} } as any,
      { user: { role: 'admin', uid: 'admin_1' } } as any,
    );
    expect(templateService.create).toHaveBeenCalledWith(
      { name: 'Classic', slug: 'classic', config: {} },
      'admin_1',
    );
    expect(result).toEqual({ template: { uid: 'tpl_1' } });
  });

  it.each([
    ['get'],
    ['create'],
    ['update'],
    ['uploadPreview'],
    ['publish'],
    ['disable'],
    ['restore'],
    ['remove'],
  ])('rejects non-admin access to %s', async (name) => {
    const controller = new AdminTemplateController(templateService as any);
    const request = { user: { role: 'user' } } as any;
    const call = {
      get: () => controller.get('tpl_1', request),
      create: () => controller.create({} as any, request),
      update: () => controller.update('tpl_1', {} as any, request),
      uploadPreview: () =>
        controller.uploadPreview('tpl_1', {} as any, request),
      publish: () => controller.publish('tpl_1', request),
      disable: () => controller.disable('tpl_1', request),
      restore: () => controller.restore('tpl_1', request),
      remove: () => controller.remove('tpl_1', request),
    }[name as string];
    await expect(call()).rejects.toThrow(ForbiddenException);
  });
});
