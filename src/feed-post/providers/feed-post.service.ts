import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FeedPostDeletionState, FeedPostStatus } from '../../schemas/feedPost/feedPost.enums';
import { FeedPost, FeedPostDocument } from '../../schemas/feedPost/feedPost.schema';

@Injectable()
export class FeedPostsService {
  constructor(@InjectModel(FeedPost.name) private feedPostModel: Model<FeedPostDocument>) { }

  async create(feedPostData: Partial<FeedPost>): Promise<FeedPostDocument> {
    return this.feedPostModel.create(feedPostData);
  }

  async update(id: string, feedPostData: Partial<FeedPost>): Promise<FeedPostDocument> {
    return this.feedPostModel
      .findOneAndUpdate({ _id: id }, feedPostData, { new: true })
      .exec();
  }

  async findById(id: string, activeOnly: boolean): Promise<FeedPostDocument> {
    const feedPostFindQuery: any = { _id: id };
    if (activeOnly) {
      feedPostFindQuery.is_deleted = false;
      feedPostFindQuery.status = FeedPostStatus.Active;
    }
    return this.feedPostModel.findOne(feedPostFindQuery).exec();
  }

  async findAllByUser(userId: string, limit: number, activeOnly: boolean, earlierThanPostId = null): Promise<FeedPostDocument[]> {
    const feedPostFindAllQuery: any = {};
    const feedPostQuery = [];
    feedPostQuery.push({ userId });
    if (earlierThanPostId && activeOnly) {
      const feedPost = await this.feedPostModel.findById(earlierThanPostId).exec();
      const createdAtDate = { createdAt: { $lt: feedPost.createdAt } };
      feedPostFindAllQuery.is_deleted = FeedPostDeletionState.NotDeleted;
      const status = FeedPostStatus.Active;
      feedPostQuery.push({ createdAtDate }, feedPostFindAllQuery, { status });
    }
    return this.feedPostModel
      .find({ $and: feedPostQuery })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }
}
