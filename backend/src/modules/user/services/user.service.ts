// THIRD PARTY IMPORTS
import { nanoid } from 'nanoid';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BadRequestException, Injectable } from '@nestjs/common';

// INNER IMPORTS
import { User } from '../schemas/user.schema';
import { CreateUserDto, UpdateUserDto } from '../dto';
import {
  _getActiveAggregationFilter,
  _getEmailAggregationFilter,
  _getIdAggregationFilter,
  _getNameAggregationFilter,
} from 'src/shared/helpers/aggregations';
import { Query as Iquery } from 'src/shared/interfaces';

@Injectable()
export class UserService {
  constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

  normalizeEmail(email: string): string {
    return String(email || '')
      .trim()
      .toLowerCase();
  }

  toPublicUser(user: any) {
    if (!user) return user;
    const value = typeof user.toObject === 'function' ? user.toObject() : user;
    const publicUser = { ...value };
    delete publicUser.password;
    delete publicUser.deleted_by;
    delete publicUser.deleted_at;
    return publicUser;
  }

  async findOne(queryObj: any = {}): Promise<User | undefined> {
    const normalizedQuery = { ...queryObj };
    if (normalizedQuery.email) {
      normalizedQuery.email = this.normalizeEmail(normalizedQuery.email);
    }
    return this.userModel.findOne(normalizedQuery);
  }

  async createUser(user: CreateUserDto) {
    const email = this.normalizeEmail(user.email);
    const checkUserExist = await this.findOne({ email });

    if (checkUserExist) {
      throw new BadRequestException({
        message: `User with given email already exists`,
      });
    }

    const payload = { ...user, email, uid: nanoid() };

    // CREATING USER
    const userCreated = await this.userModel.create(payload);

    return userCreated;
  }

  async updateUser(payload: UpdateUserDto, filter = {}) {
    return this.userModel.findOneAndUpdate(filter, payload, {
      new: true,
    });
  }

  async getAllUsers(query: Iquery = {}) {
    const baseQuery = [
      {
        $match: {
          $and: [
            ..._getIdAggregationFilter(query),
            ..._getActiveAggregationFilter(query),
            ..._getEmailAggregationFilter(query),
            ..._getNameAggregationFilter(query),
          ],
        },
      },
    ];

    return this.userModel.aggregate([
      ...baseQuery,
      { $project: { password: 0, deleted_by: 0, deleted_at: 0 } },
    ]);
  }
}
