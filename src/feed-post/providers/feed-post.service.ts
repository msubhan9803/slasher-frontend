import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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

  async findById(id: string): Promise<FeedPostDocument> {
    return this.feedPostModel.findById(id).exec();
  }

  async findAllByUser(userId: string, limit: number, earlierThanPostId = null): Promise<FeedPostDocument[]> {
    if (earlierThanPostId) {
      return this.feedPostModel
        .find({ userId })
        .sort({ _id: -1 })
        .limit(limit)
        .exec();
    }
      return this.feedPostModel
        .find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .exec();
  }
}
