import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

const MAX_PREVIEW_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export interface PreviewUpload {
  buffer: Buffer;
  mimetype: string;
  size: number;
  originalname?: string;
}

export interface UploadedPreview {
  secureUrl: string;
  publicId: string;
  width?: number;
  height?: number;
  bytes: number;
  format?: string;
}

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private readonly configService: ConfigService) {}

  private configure(): void {
    const cloudName = this.configService.get<string>('cloudinary.cloud_name');
    const apiKey = this.configService.get<string>('cloudinary.api_key');
    const apiSecret = this.configService.get<string>('cloudinary.api_secret');
    if (!cloudName || !apiKey || !apiSecret) {
      throw new ServiceUnavailableException(
        'template image uploads are not configured',
      );
    }
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
  }

  validatePreview(file: PreviewUpload): void {
    if (!file?.buffer || !Buffer.isBuffer(file.buffer)) {
      throw new BadRequestException('preview image is required');
    }
    if (
      file.size > MAX_PREVIEW_BYTES ||
      file.buffer.length > MAX_PREVIEW_BYTES
    ) {
      throw new BadRequestException('preview image must be 5 MB or smaller');
    }
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException('preview image must be JPEG, PNG, or WebP');
    }
  }

  async uploadPreview(
    file: PreviewUpload,
    templateUid: string,
    version: number,
  ): Promise<UploadedPreview> {
    this.validatePreview(file);
    this.configure();
    const folder =
      this.configService.get<string>('cloudinary.folder') ||
      'kungacv/templates';
    const publicId = `${templateUid}/v${version}/preview`;

    try {
      const result = await new Promise<UploadApiResponse>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder,
            public_id: publicId,
            overwrite: true,
            resource_type: 'image',
            invalidate: true,
          },
          (error, response) =>
            error ? reject(error) : resolve(response as UploadApiResponse),
        );
        stream.end(file.buffer);
      });
      return {
        secureUrl: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        format: result.format,
      };
    } catch (error) {
      this.logger.error(
        JSON.stringify({
          event: 'cloudinary_preview_upload_failed',
          templateUid,
          version,
        }),
        error instanceof Error ? error.stack : undefined,
      );
      throw new ServiceUnavailableException('template preview upload failed');
    }
  }

  async deletePreview(publicId: string | null | undefined): Promise<void> {
    if (!publicId) return;
    this.configure();
    try {
      await cloudinary.uploader.destroy(publicId, {
        invalidate: true,
        resource_type: 'image',
      });
    } catch (error) {
      this.logger.error(
        JSON.stringify({ event: 'cloudinary_preview_delete_failed' }),
        error instanceof Error ? error.stack : undefined,
      );
      throw new ServiceUnavailableException('template preview cleanup failed');
    }
  }
}
