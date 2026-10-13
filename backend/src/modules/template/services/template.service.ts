import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { nanoid } from 'nanoid';
import {
  CloudinaryService,
  PreviewUpload,
} from 'src/modules/media/cloudinary.service';
import { Subscription } from 'src/modules/subscription/schemas/subscriptions.schema';
import {
  CreateTemplateDto,
  TemplateListQueryDto,
  UpdateTemplateDto,
} from '../dto/template.dto';
import { Template, TemplateAccess } from '../schemas/template.schema';

const SORT_FIELDS = new Set(['sortOrder', 'name', 'createdAt', 'updatedAt']);

@Injectable()
export class TemplateService {
  constructor(
    @InjectModel(Template.name) private readonly templateModel: Model<Template>,
    @InjectModel(Subscription.name)
    private readonly subscriptionModel: Model<Subscription>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(payload: CreateTemplateDto, actorUid: string) {
    const slug = this.normalizeSlug(payload.slug || payload.name);
    await this.assertSlugAvailable(slug);
    const packageUids = this.uniqueStrings(payload.packageUids);
    await this.assertPackagesExist(packageUids, false);
    const created = await this.templateModel.create({
      ...payload,
      uid: `tpl_${nanoid(14)}`,
      slug,
      packageUids,
      access: payload.access || TemplateAccess.FREE,
      version: payload.version || 1,
      sortOrder: payload.sortOrder || 0,
      published: false,
      active: true,
      createdBy: actorUid,
      updatedBy: actorUid,
      deletedAt: null,
      deletedBy: null,
    });
    return created;
  }

  async listPublic(query: TemplateListQueryDto) {
    return this.list(query, {
      active: true,
      published: true,
      deletedAt: null,
    });
  }

  async listAdmin(query: TemplateListQueryDto) {
    const filter: Record<string, unknown> = {};
    if (!query.includeDeleted) filter.deletedAt = null;
    if (query.active !== undefined) filter.active = query.active;
    if (query.published !== undefined) filter.published = query.published;
    if (query.access) filter.access = query.access;
    if (query.packageUid) filter.packageUids = query.packageUid;
    return this.list(query, filter);
  }

  async findPublicByUid(uid: string) {
    const template = await this.templateModel
      .findOne({ uid, active: true, published: true, deletedAt: null })
      .lean();
    if (!template) throw new NotFoundException('template not found');
    return template;
  }

  async findPublicBySlug(slug: string) {
    return this.findPublicByUidOrSlug(this.normalizeSlug(slug));
  }

  async findAdmin(uid: string) {
    const template = await this.templateModel.findOne({ uid }).lean();
    if (!template) throw new NotFoundException('template not found');
    return template;
  }

  async update(uid: string, payload: UpdateTemplateDto, actorUid: string) {
    const current = await this.templateModel.findOne({ uid });
    if (!current) throw new NotFoundException('template not found');
    if (
      current.published &&
      payload.slug &&
      this.normalizeSlug(payload.slug) !== current.slug
    ) {
      throw new BadRequestException('published template slugs cannot change');
    }
    const nextSlug = payload.slug
      ? this.normalizeSlug(payload.slug)
      : current.slug;
    if (nextSlug !== current.slug)
      await this.assertSlugAvailable(nextSlug, uid);
    const packageUids = payload.packageUids
      ? this.uniqueStrings(payload.packageUids)
      : current.packageUids;
    await this.assertPackagesExist(packageUids, false);
    Object.assign(current, {
      ...payload,
      slug: nextSlug,
      packageUids,
      updatedBy: actorUid,
    });
    return current.save();
  }

  async publish(uid: string, actorUid: string) {
    const template = await this.templateModel.findOne({ uid });
    if (!template) throw new NotFoundException('template not found');
    if (!template.config)
      throw new BadRequestException('template configuration is required');
    if (!template.previewUrl)
      throw new BadRequestException(
        'template preview is required before publishing',
      );
    if (template.access === TemplateAccess.PAID) {
      await this.assertPackagesExist(template.packageUids, true);
    }
    template.published = true;
    template.active = true;
    template.updatedBy = actorUid;
    template.deletedAt = null;
    template.deletedBy = null;
    return template.save();
  }

  async disable(uid: string, actorUid: string) {
    return this.updateLifecycle(uid, { active: false, updatedBy: actorUid });
  }

  async restore(uid: string, actorUid: string) {
    return this.updateLifecycle(uid, {
      active: true,
      deletedAt: null,
      deletedBy: null,
      updatedBy: actorUid,
    });
  }

  async softDelete(uid: string, actorUid: string) {
    return this.updateLifecycle(uid, {
      active: false,
      published: false,
      deletedAt: new Date(),
      deletedBy: actorUid,
      updatedBy: actorUid,
    });
  }

  async uploadPreview(uid: string, file: PreviewUpload) {
    const template = await this.templateModel.findOne({ uid });
    if (!template) throw new NotFoundException('template not found');
    const previousPublicId = template.previewPublicId;
    const uploaded = await this.cloudinaryService.uploadPreview(
      file,
      template.uid,
      template.version,
    );
    try {
      template.previewUrl = uploaded.secureUrl;
      template.previewPublicId = uploaded.publicId;
      const saved = await template.save();
      if (previousPublicId && previousPublicId !== uploaded.publicId) {
        await this.cloudinaryService.deletePreview(previousPublicId);
      }
      return saved;
    } catch (error) {
      await this.cloudinaryService
        .deletePreview(uploaded.publicId)
        .catch(() => undefined);
      throw error;
    }
  }

  private async findPublicByUidOrSlug(value: string) {
    const template = await this.templateModel
      .findOne({
        $or: [{ uid: value }, { slug: value }],
        active: true,
        published: true,
        deletedAt: null,
      })
      .lean();
    if (!template) throw new NotFoundException('template not found');
    return template;
  }

  private async list(
    query: TemplateListQueryDto,
    baseFilter: Record<string, unknown>,
  ) {
    const filter: Record<string, unknown> = { ...baseFilter };
    if (query.search) {
      const escaped = query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { name: { $regex: escaped, $options: 'i' } },
        { slug: { $regex: escaped, $options: 'i' } },
      ];
    }
    if (query.access) filter.access = query.access;
    const sortField = SORT_FIELDS.has(query.sort) ? query.sort : 'sortOrder';
    const sortDirection = query.order === 'desc' ? -1 : 1;
    const skip = (query.page - 1) * query.perPage;
    const [data, total] = await Promise.all([
      this.templateModel
        .find(filter)
        .sort({ [sortField]: sortDirection, _id: 1 })
        .skip(skip)
        .limit(query.perPage)
        .lean(),
      this.templateModel.countDocuments(filter),
    ]);
    return { data, total, page: query.page, perPage: query.perPage };
  }

  private async updateLifecycle(uid: string, update: Record<string, unknown>) {
    const updated = await this.templateModel
      .findOneAndUpdate({ uid }, update, { new: true })
      .lean();
    if (!updated) throw new NotFoundException('template not found');
    return updated;
  }

  private async assertSlugAvailable(slug: string, exceptUid?: string) {
    const existing = await this.templateModel
      .findOne({ slug, ...(exceptUid ? { uid: { $ne: exceptUid } } : {}) })
      .lean();
    if (existing) throw new ConflictException('template slug already exists');
  }

  private async assertPackagesExist(
    packageUids: string[],
    requireActive: boolean,
  ) {
    if (!packageUids.length) return;
    const filter: Record<string, unknown> = {
      uid: { $in: packageUids },
      deleted_at: null,
    };
    if (requireActive) filter.active = true;
    const count = await this.subscriptionModel.countDocuments(filter);
    if (count !== packageUids.length) {
      throw new BadRequestException(
        'one or more pricing packages are unavailable',
      );
    }
  }

  private uniqueStrings(values: string[] = []) {
    return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
  }

  private normalizeSlug(value: string) {
    const slug = String(value || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    if (!slug)
      throw new BadRequestException('a valid template slug is required');
    return slug;
  }
}
