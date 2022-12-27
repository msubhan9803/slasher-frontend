import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { RssFeedProvider, RssFeedProviderDocument } from '../../schemas/rssFeedProvider/rssFeedProvider.schema';
import {
  RssFeedProviderActiveStatus,
  RssFeedProviderAutoFollow,
  RssFeedProviderDeletionStatus,
} from '../../schemas/rssFeedProvider/rssFeedProvider.enums';

@Injectable()
export class RssFeedProvidersService {
  constructor(@InjectModel(RssFeedProvider.name) private rssFeedProviderModel: Model<RssFeedProviderDocument>) { }

  async create(rssFeedProviderData: Partial<RssFeedProvider>): Promise<RssFeedProviderDocument> {
    return this.rssFeedProviderModel.create(rssFeedProviderData);
  }

  async update(id: string, rssFeedProviderData: Partial<RssFeedProvider>): Promise<RssFeedProviderDocument> {
    return this.rssFeedProviderModel
      .findOneAndUpdate({ _id: id }, rssFeedProviderData, { new: true })
      .exec();
  }

  async findById(id: string, activeOnly: boolean): Promise<RssFeedProviderDocument> {
    const rssFeedProviderFindQuery: any = { _id: id };
    if (activeOnly) {
      rssFeedProviderFindQuery.is_deleted = false;
      rssFeedProviderFindQuery.status = RssFeedProviderActiveStatus.Active;
    }
    return this.rssFeedProviderModel.findOne(rssFeedProviderFindQuery).exec();
  }

  async findAll(
    limit: number,
    activeOnly: boolean,
    after?: mongoose.Types.ObjectId,
  ): Promise<RssFeedProviderDocument[]> {
    const rssFeedProviderFindAllQuery: any = {};
    if (activeOnly) {
      rssFeedProviderFindAllQuery.is_deleted = RssFeedProviderDeletionStatus.NotDeleted;
      rssFeedProviderFindAllQuery.status = RssFeedProviderActiveStatus.Active;
    }
    if (after) {
      const afterEvent = await this.rssFeedProviderModel.findById(after);
      rssFeedProviderFindAllQuery.sortTitle = { $gt: afterEvent.sortTitle };
    }
    return this.rssFeedProviderModel.find(rssFeedProviderFindAllQuery)
      .sort({ sortTitle: 1 })
      .limit(limit)
      .exec();
  }

  async findAllAutoFollowRssFeedProviders(): Promise<RssFeedProviderDocument[]> {
    return this.rssFeedProviderModel
      .find({
        auto_follow: RssFeedProviderAutoFollow.Yes,
        status: RssFeedProviderActiveStatus.Active,
        deleted: RssFeedProviderDeletionStatus.NotDeleted,
      })
      .exec();
  }
}
