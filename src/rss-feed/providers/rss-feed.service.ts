import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RssFeed, RssFeedDocument } from '../../schemas/rssFeed/rssFeed.schema';
import { RssFeedDeletionStatus } from '../../schemas/rssFeed/rssFeed.enums';

@Injectable()
export class RssFeedService {
  constructor(@InjectModel(RssFeed.name) private rssFeedModel: Model<RssFeedDocument>) { }

  async create(rssFeed: Partial<RssFeed>) {
    return this.rssFeedModel.create(rssFeed);
  }

  async findById(id: string, activeOnly: boolean): Promise<RssFeedDocument> {
    const rssFeedFindQuery: any = { _id: id };
    if (activeOnly) {
      rssFeedFindQuery.deleted = RssFeedDeletionStatus.NotDeleted;
    }
    return this.rssFeedModel.findOne(rssFeedFindQuery).exec();
  }

  async update(id: string, updateRssFeedDto: Partial<RssFeedDocument>): Promise<RssFeedDocument> {
    return this.rssFeedModel
      .findOneAndUpdate({ _id: id }, updateRssFeedDto, { new: true })
      .exec();
  }
}
