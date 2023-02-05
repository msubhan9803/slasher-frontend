import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { FriendsService } from '../../friends/providers/friends.service';
import { RssFeedProviderFollowsService } from '../../rss-feed-provider-follows/providers/rss-feed-provider-follows.service';
import { FeedPostDeletionState, FeedPostStatus } from '../../schemas/feedPost/feedPost.enums';
import { FeedPost, FeedPostDocument } from '../../schemas/feedPost/feedPost.schema';

@Injectable()
export class FeedPostsService {
  constructor(
    @InjectModel(FeedPost.name) private feedPostModel: Model<FeedPostDocument>,
    private readonly rssFeedProviderFollowsService: RssFeedProviderFollowsService,
    private readonly friendsService: FriendsService,
  ) { }

  async create(feedPostData: Partial<FeedPost>): Promise<FeedPostDocument> {
    return this.feedPostModel.create(feedPostData);
  }

  async update(id: string, feedPostData: Partial<FeedPost>): Promise<FeedPostDocument> {
    return this.feedPostModel
      .findOneAndUpdate({ _id: id }, { ...feedPostData, lastUpdateAt: Date.now() }, { new: true })
      .exec();
  }

  async findById(id: string, activeOnly: boolean): Promise<FeedPostDocument> {
    const feedPostFindQuery: any = { _id: id };
    if (activeOnly) {
      feedPostFindQuery.is_deleted = false;
      feedPostFindQuery.status = FeedPostStatus.Active;
    }
    return this.feedPostModel
      .findOne(feedPostFindQuery)
      .populate('userId', 'userName _id profilePic profile_status')
      .populate('rssfeedProviderId', 'title _id logo')
      .populate('rssFeedId', 'content')
      .exec();
  }

  async findAllByUser(userId: string, limit: number, activeOnly: boolean, before?: mongoose.Types.ObjectId): Promise<FeedPostDocument[]> {
    const feedPostFindAllQuery: any = {};
    const feedPostQuery = [];
    feedPostQuery.push({ userId });
    if (before) {
      const feedPost = await this.feedPostModel.findById(before).exec();
      feedPostQuery.push({ createdAt: { $lt: feedPost.createdAt } });
    }
    if (activeOnly) {
      feedPostFindAllQuery.is_deleted = FeedPostDeletionState.NotDeleted;
      feedPostFindAllQuery.status = FeedPostStatus.Active;
      feedPostQuery.push(feedPostFindAllQuery);
    }
    return this.feedPostModel
      .find({ $and: feedPostQuery })
      .populate('userId', 'userName _id profilePic')
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async findMainFeedPostsForUser(userId: string, limit: number, before?: mongoose.Types.ObjectId): Promise<FeedPostDocument[]> {
    // Get the list of rss feed providers that the user is following
    const rssFeedProviderIds = (await this.rssFeedProviderFollowsService.findAllByUserId(userId)).map((follow) => follow.rssfeedProviderId);
    // Get the list of friend ids
    const friendIds = await this.friendsService.getFriendIds(userId);

    // Optionally, only include posts that are older than the given `before` post
    const beforeQuery: any = {};
    if (before) {
      const feedPost = await this.feedPostModel.findById(before).exec();
      beforeQuery.updatedAt = { $lt: feedPost.updatedAt };
    }

    const query = this.feedPostModel
      .find({
        $and: [
          { status: 1 },
          { is_deleted: 0 },
          {
            $or: [
              { userId: { $eq: userId } },
              { userId: { $in: [...friendIds, new mongoose.Types.ObjectId(userId)] } },
              { rssfeedProviderId: { $in: rssFeedProviderIds } },
            ],
          },
          { hideUsers: { $ne: new mongoose.Types.ObjectId(userId) } },
          beforeQuery,
        ],
      })
      .populate('userId', '_id userName profilePic')
      .populate('rssfeedProviderId', '_id title logo')
      .sort({ lastUpdateAt: -1 })
      .limit(limit);

    return query.exec();
  }

  async findAllPostsWithImagesByUser(userId: string, limit: number, before?: mongoose.Types.ObjectId): Promise<FeedPostDocument[]> {
    // Optionally, only include posts that are older than the given `before` post
    const beforeQuery: any = {};
    if (before) {
      const feedPost = await this.feedPostModel.findById(before).exec();
      beforeQuery.createdAt = { $lt: feedPost.createdAt };
    }

    return this.feedPostModel
      .find({
        $and: [
          { userId },
          { is_deleted: FeedPostDeletionState.NotDeleted },
          { status: FeedPostStatus.Active },
          { 'images.0': { $exists: true } },
          beforeQuery,
        ],
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async findAllByRssFeedProvider(
    rssfeedProviderId: string,
    limit: number,
    activeOnly: boolean,
    before?: mongoose.Types.ObjectId,
  ): Promise<FeedPostDocument[]> {
    const feedPostFindAllQuery: any = {};
    const feedPostQuery = [];
    feedPostQuery.push({ rssfeedProviderId });
    if (before) {
      const feedPost = await this.feedPostModel.findById(before).exec();
      feedPostQuery.push({ createdAt: { $lt: feedPost.createdAt } });
    }
    if (activeOnly) {
      feedPostFindAllQuery.is_deleted = FeedPostDeletionState.NotDeleted;
      feedPostFindAllQuery.status = FeedPostStatus.Active;
      feedPostQuery.push(feedPostFindAllQuery);
    }
    return this.feedPostModel
      .find({ $and: feedPostQuery })
      .populate('rssfeedProviderId', 'title _id logo')
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  // TODO: Add a test for this method
  async incrementCommentCount(id: string) {
    await this.feedPostModel.updateOne({ _id: new mongoose.Types.ObjectId(id) }, { $inc: { commentCount: 1 } });
  }

  // TODO: Add a test for this method
  async decrementCommentCount(id: string) {
    await this.feedPostModel.updateOne({ _id: new mongoose.Types.ObjectId(id) }, { $inc: { commentCount: -1 } });
  }

  // TODO: Add a test for this method
  async addLike(id: string, userId: string) {
    await this.feedPostModel.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { $addToSet: { likes: new mongoose.Types.ObjectId(userId) }, $inc: { likeCount: 1 } },
    );
  }

  // TODO: Add a test for this method
  async removeLike(id: string, userId: string) {
    await this.feedPostModel.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { $pull: { likes: new mongoose.Types.ObjectId(userId) }, $inc: { likeCount: -1 } },
    );
  }

  /**
   * For the given array of rssFeedId values, finds all posts that match those values.
   * @param rssFeedIds
   */
  // TODO: Add a test for this method
  async findAllByRssFeedId(rssFeedIds: string[]) {
    return this.feedPostModel.find({ rssFeedId: { $in: rssFeedIds } });
  }

  async hidePost(id: string, userId: string) {
    const updatedPost = await this.feedPostModel.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { $addToSet: { hideUsers: new mongoose.Types.ObjectId(userId) } },
    );

    return updatedPost;
  }
}
