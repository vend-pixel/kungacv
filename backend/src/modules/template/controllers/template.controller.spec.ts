import { BadRequestException, ForbiddenException } from '@nestjs/common';
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

  it.each([
    ['uid', () => new TemplateController(templateService as any).getByUid('tpl_1')],
    ['slug', () => new TemplateController(templateService as any).getBySlug('classic')],
  ])('returns a public template envelope for %s lookups', async (_kind, call) => {
    templateService.findPublicByUid.mockResolvedValue({ uid: 'tpl_1' });
    templateService.findPublicBySlug.mockResolvedValue({ uid: 'tpl_1' });
    await expect(call()).resolves.toEqual({ template: { uid: 'tpl_1' } });
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

  it('delegates the complete admin lifecycle to the service', async () => {
    const controller = new AdminTemplateController(templateService as any);
    const request = { user: { role: 'admin', uid: 'admin_1' } } as any;
    templateService.findAdmin.mockResolvedValue({ uid: 'tpl_1' });
    templateService.update.mockResolvedValue({ uid: 'tpl_1' });
    templateService.publish.mockResolvedValue({ uid: 'tpl_1' });
    templateService.disable.mockResolvedValue({ uid: 'tpl_1' });
    templateService.restore.mockResolvedValue({ uid: 'tpl_1' });
    templateService.softDelete.mockResolvedValue({ uid: 'tpl_1' });

    await expect(controller.get('tpl_1', request)).resolves.toEqual({
      template: { uid: 'tpl_1' },
    });
    await controller.update('tpl_1', { name: 'Updated' } as any, request);
    await controller.publish('tpl_1', request);
    await controller.disable('tpl_1', request);
    await controller.restore('tpl_1', request);
    await controller.remove('tpl_1', request);

    expect(templateService.update).toHaveBeenCalledWith(
      'tpl_1',
      { name: 'Updated' },
      'admin_1',
    );
    expect(templateService.publish).toHaveBeenCalledWith('tpl_1', 'admin_1');
    expect(templateService.disable).toHaveBeenCalledWith('tpl_1', 'admin_1');
    expect(templateService.restore).toHaveBeenCalledWith('tpl_1', 'admin_1');
    expect(templateService.softDelete).toHaveBeenCalledWith('tpl_1', 'admin_1');
  });

  it('rejects missing, oversized, and unsupported preview uploads', async () => {
    const controller = new AdminTemplateController(templateService as any);
    const request = { user: { role: 'admin', uid: 'admin_1' } } as any;

    await expect(controller.uploadPreview('tpl_1', undefined as any, request)).rejects.toThrow(
      BadRequestException,
    );
    await expect(
      controller.uploadPreview(
        'tpl_1',
        { buffer: Buffer.alloc(5 * 1024 * 1024 + 1), size: 5 * 1024 * 1024 + 1, mimetype: 'image/png' },
        request,
      ),
    ).rejects.toThrow(BadRequestException);
    await expect(
      controller.uploadPreview(
        'tpl_1',
        { buffer: Buffer.from('test'), size: 4, mimetype: 'application/pdf' },
        request,
      ),
    ).rejects.toThrow(BadRequestException);
    expect(templateService.uploadPreview).not.toHaveBeenCalled();
  });

  it('forwards valid preview uploads with the admin request', async () => {
    templateService.uploadPreview.mockResolvedValue({ uid: 'tpl_1' });
    const controller = new AdminTemplateController(templateService as any);
    const file = { buffer: Buffer.from('png'), size: 3, mimetype: 'image/png' };
    await expect(
      controller.uploadPreview('tpl_1', file, {
        user: { role: 'admin', uid: 'admin_1' },
      } as any),
    ).resolves.toEqual({ template: { uid: 'tpl_1' } });
    expect(templateService.uploadPreview).toHaveBeenCalledWith('tpl_1', file);
  });

  it.each([
    'get',
    'create',
    'update',
    'uploadPreview',
    'publish',
    'disable',
    'restore',
    'remove',
  ])('rejects non-admin access to %s', async (name) => {
    const controller = new AdminTemplateController(templateService as any);
    const request = { user: { role: 'user' } } as any;
    const calls: Record<string, () => Promise<unknown>> = {
      get: () => controller.get('tpl_1', request),
      create: () => controller.create({} as any, request),
      update: () => controller.update('tpl_1', {} as any, request),
      uploadPreview: () => controller.uploadPreview('tpl_1', {} as any, request),
      publish: () => controller.publish('tpl_1', request),
      disable: () => controller.disable('tpl_1', request),
      restore: () => controller.restore('tpl_1', request),
      remove: () => controller.remove('tpl_1', request),
    };
    await expect(calls[name]()).rejects.toThrow(ForbiddenException);
  });
});
