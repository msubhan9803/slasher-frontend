import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RssFeedProviderFollow, RssFeedProviderFollowDocument } from '../../schemas/rssFeedProviderFollow/rssFeedProviderFollow.schema';

@Injectable()
export class RssFeedProviderFollowsService {
  constructor(@InjectModel(RssFeedProviderFollow.name) private rssFeedProviderFollowModel: Model<RssFeedProviderFollowDocument>) { }

  async create(rssfeedProviderFollowData: Partial<RssFeedProviderFollow>) {
    return this.rssFeedProviderFollowModel.create(rssfeedProviderFollowData);
  }

  async update(id: string, rssfeedProviderFollowData: Partial<RssFeedProviderFollow>): Promise<RssFeedProviderFollow> {
    return this.rssFeedProviderFollowModel
      .findOneAndUpdate({ _id: id }, rssfeedProviderFollowData, { new: true })
      .exec();
  }

  async findById(id: string): Promise<RssFeedProviderFollow> {
    return this.rssFeedProviderFollowModel.findOne({ _id: id }).exec();
  }

  async findAllByUserId(userId: string): Promise<RssFeedProviderFollow[]> {
    return this.rssFeedProviderFollowModel.find({ userId }).exec();
  }

  async findByUserAndRssFeedProvider(userId: string, rssfeedProviderId: string): Promise<RssFeedProviderFollow> {
    return this.rssFeedProviderFollowModel.findOne({
      userId,
      rssfeedProviderId,
    }).exec();
  }

  async deleteById(id: string): Promise<void> {
    await this.rssFeedProviderFollowModel.deleteOne({ _id: id }).exec();
  }
}
