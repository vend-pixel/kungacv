import {
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';

describe('CloudinaryService', () => {
  const config = (values: Record<string, string | undefined> = {}) =>
    ({ get: jest.fn((key: string) => values[key]) }) as any;

  it('rejects missing preview files', () => {
    const service = new CloudinaryService(config());
    expect(() => service.validatePreview(undefined as any)).toThrow(
      BadRequestException,
    );
  });

  it('rejects unsupported MIME types and oversized files', () => {
    const service = new CloudinaryService(config());
    expect(() =>
      service.validatePreview({
        buffer: Buffer.from('x'),
        mimetype: 'application/pdf',
        size: 1,
      }),
    ).toThrow(BadRequestException);
    expect(() =>
      service.validatePreview({
        buffer: Buffer.alloc(5 * 1024 * 1024 + 1),
        mimetype: 'image/png',
        size: 5 * 1024 * 1024 + 1,
      }),
    ).toThrow(BadRequestException);
  });

  it('fails safely when Cloudinary is not configured', async () => {
    const service = new CloudinaryService(config());
    await expect(
      service.uploadPreview(
        { buffer: Buffer.from('x'), mimetype: 'image/png', size: 1 },
        'tpl_1',
        1,
      ),
    ).rejects.toThrow(ServiceUnavailableException);
  });

  it('ignores deletion when no previous asset exists', async () => {
    const service = new CloudinaryService(config());
    await expect(service.deletePreview(null)).resolves.toBeUndefined();
  });
});
