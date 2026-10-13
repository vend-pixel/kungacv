import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subscription } from '../schemas/subscriptions.schema';
import { CreateSubscriptionDto, UpdateSubscriptionDto } from '../dto';
import { Query } from 'src/shared/interfaces';
import {
  _getActiveAggregationFilter,
  _getIdAggregationFilter,
  _getNameAggregationFilter,
  _getPriceAggregationFilter,
} from 'src/shared/helpers/aggregations';
import { nanoid } from 'nanoid';
import { AdminPricingListQueryDto } from '../dto/admin-pricing.dto';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectModel('Subscription')
    private readonly subscriptionModel: Model<Subscription>,
  ) {}

  async createSubscription(payload: CreateSubscriptionDto) {
    payload.uid = nanoid();

    const data = await this.subscriptionModel.create(payload);

    return data;
  }

  async getAllSubscriptions(query: Query) {
    const baseQuery = [
      {
        $match: {
          $and: [
            ..._getIdAggregationFilter(query),
            ..._getActiveAggregationFilter(query),
            ..._getNameAggregationFilter(query),
            ..._getPriceAggregationFilter(query),
          ],
        },
      },
    ];

    const subscriptions = this.subscriptionModel.aggregate(baseQuery);

    return subscriptions;
  }

  getParsedQuery(query: Query) {
    let {
      name,
      uid,
      active = true,
      minPrice = null,
      maxPrice = null,
      count,
    } = query;

    active = [true, 'true'].includes(active);
    uid = uid ? (Array.isArray(uid) ? uid : [uid]) : null;
    name = name ? (Array.isArray(name) ? name : [name]) : null;
    minPrice = minPrice !== null && !isNaN(minPrice) ? Number(minPrice) : null;
    maxPrice = maxPrice !== null && !isNaN(maxPrice) ? Number(maxPrice) : null;
    count = [true, 'true'].includes(count) ? count : null;

    return {
      name,
      minPrice,
      maxPrice,
      uid,
      active,
      count,
    };
  }

  async editSubscriptions(filter = {}, payload: UpdateSubscriptionDto = {}) {
    return this.subscriptionModel.findOneAndUpdate(filter, payload, {
      new: true,
    });
  }

  async listAdmin(query: AdminPricingListQueryDto) {
    const filter: Record<string, unknown> = {};
    if (!query.includeDeleted) filter.deleted_at = null;
    if (query.active !== undefined) filter.active = query.active;
    if (query.search) {
      const escaped = query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { name: { $regex: escaped, $options: 'i' } },
        { slug: { $regex: escaped, $options: 'i' } },
      ];
    }
    const sortFields = new Set([
      'name',
      'price',
      'duration',
      'sortOrder',
      'createdAt',
      'updatedAt',
    ]);
    const sortField = sortFields.has(query.sort) ? query.sort : 'sortOrder';
    const direction = query.order === 'desc' ? -1 : 1;
    const skip = (query.page - 1) * query.perPage;
    const [subscriptions, count] = await Promise.all([
      this.subscriptionModel
        .find(filter)
        .sort({ [sortField]: direction, _id: 1 })
        .skip(skip)
        .limit(query.perPage)
        .lean(),
      this.subscriptionModel.countDocuments(filter),
    ]);
    return { subscriptions, count, page: query.page, perPage: query.perPage };
  }

  async findAdmin(uid: string) {
    const subscription = await this.subscriptionModel.findOne({ uid }).lean();
    if (!subscription) throw new NotFoundException('pricing package not found');
    return subscription;
  }

  async createAdmin(payload: CreateSubscriptionDto, actorUid: string) {
    const slug = this.normalizeSlug(payload.slug || payload.name);
    await this.assertSlugAvailable(slug);
    return this.subscriptionModel.create({
      ...payload,
      uid: `pkg_${nanoid(14)}`,
      slug,
      created_by: actorUid,
      currency: payload.currency || 'MWK',
      price: payload.price ?? 0,
      sortOrder: payload.sortOrder ?? 0,
      active: payload.active ?? true,
      deleted_at: null,
      deleted_by: null,
    });
  }

  async updateAdmin(
    uid: string,
    payload: UpdateSubscriptionDto,
    actorUid: string,
  ) {
    const current = await this.subscriptionModel.findOne({ uid });
    if (!current) throw new NotFoundException('pricing package not found');
    const slug = payload.slug ? this.normalizeSlug(payload.slug) : current.slug;
    if (slug !== current.slug) await this.assertSlugAvailable(slug, uid);
    Object.assign(current, {
      ...payload,
      slug,
      created_by: current.created_by,
      updated_by: actorUid,
    });
    return current.save();
  }

  async setActive(uid: string, active: boolean, actorUid: string) {
    const updated = await this.subscriptionModel
      .findOneAndUpdate(
        { uid },
        { active, updated_by: actorUid },
        { new: true },
      )
      .lean();
    if (!updated) throw new NotFoundException('pricing package not found');
    return updated;
  }

  async softDelete(uid: string, actorUid: string) {
    const updated = await this.subscriptionModel
      .findOneAndUpdate(
        { uid },
        { active: false, deleted_at: new Date(), deleted_by: actorUid },
        { new: true },
      )
      .lean();
    if (!updated) throw new NotFoundException('pricing package not found');
    return updated;
  }

  private async assertSlugAvailable(slug: string, exceptUid?: string) {
    const existing = await this.subscriptionModel
      .findOne({ slug, ...(exceptUid ? { uid: { $ne: exceptUid } } : {}) })
      .lean();
    if (existing)
      throw new ConflictException('pricing package slug already exists');
  }

  private normalizeSlug(value: string) {
    return (
      String(value || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'package'
    );
  }
}
