/* eslint-disable max-lines */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { FriendsService } from '../../friends/providers/friends.service';
import { RssFeedProviderFollowsService } from '../../rss-feed-provider-follows/providers/rss-feed-provider-follows.service';
import { FeedPostDeletionState, FeedPostStatus, PostType } from '../../schemas/feedPost/feedPost.enums';
import { FeedPost, FeedPostDocument } from '../../schemas/feedPost/feedPost.schema';
import { User, UserDocument } from '../../schemas/user/user.schema';
import { FriendRequestReaction } from '../../schemas/friend/friend.enums';
import { relativeToFullImagePath } from '../../utils/image-utils';
import { FeedPostLike, FeedPostLikeDocument } from '../../schemas/feedPostLike/feedPostLike.schema';
import { BlocksService } from '../../blocks/providers/blocks.service';
import { pick } from '../../utils/object-utils';

@Injectable()
export class FeedPostsService {
  constructor(
    @InjectModel(FeedPost.name) private feedPostModel: Model<FeedPostDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(FeedPostLike.name) private feedLikesModel: Model<FeedPostLikeDocument>,
    private readonly rssFeedProviderFollowsService: RssFeedProviderFollowsService,
    private readonly friendsService: FriendsService,
    private readonly blocksService: BlocksService,
    private configService: ConfigService,
  ) { }

  async create(feedPostData: Partial<FeedPost>): Promise<FeedPostDocument> {
    return this.feedPostModel.create(feedPostData);
  }

  async update(id: string, feedPostData: Partial<FeedPost>): Promise<FeedPostDocument> {
    return this.feedPostModel
      .findOneAndUpdate({ _id: id }, { ...feedPostData, lastUpdateAt: Date.now() }, { new: true })
      .exec();
  }

  async findById(
    id: string,
    activeOnly: boolean,
    identifyLikesForUser?: mongoose.Schema.Types.ObjectId,
  ): Promise<FeedPostDocument> {
    const feedPostFindQuery: any = { _id: id };
    if (activeOnly) {
      feedPostFindQuery.is_deleted = false;
      feedPostFindQuery.status = FeedPostStatus.Active;
    }
    const feedPost = await this.feedPostModel
      .findOne(feedPostFindQuery)
      .populate('userId', 'userName _id profilePic profile_status')
      .populate('rssfeedProviderId', 'title _id logo')
      .populate('rssFeedId', 'content')
      .exec();

    if (feedPost) {
      feedPost.likeCount = feedPost.likes.length || 0;
      (feedPost as any).likedByUser = feedPost.likes.includes(identifyLikesForUser);
    }
    return feedPost;
  }

  async findAllByUser(userId: string, limit: number, activeOnly: boolean, before?: mongoose.Types.ObjectId): Promise<FeedPostDocument[]> {
    const feedPostFindAllQuery: any = {};
    const feedPostQuery = [];
    feedPostQuery.push({ userId: new mongoose.Types.ObjectId(userId) });
    //remove postType query when we have support for postType.User
    feedPostQuery.push(
    { postType: { $ne: PostType.MovieReview } },
          { postType: { $ne: PostType.News } },
    );
    if (before) {
      const feedPost = await this.feedPostModel.findById(before).exec();
      feedPostQuery.push({ createdAt: { $lt: feedPost.createdAt } });
    }
    if (activeOnly) {
      feedPostFindAllQuery.is_deleted = FeedPostDeletionState.NotDeleted;
      feedPostFindAllQuery.status = FeedPostStatus.Active;
      feedPostQuery.push(feedPostFindAllQuery);
    }
    const feedPosts = await this.feedPostModel
      .find({ $and: feedPostQuery })
      .populate('userId', 'userName _id profilePic')
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();

    return JSON.parse(JSON.stringify(feedPosts)).map((post) => {
      // eslint-disable-next-line no-param-reassign
      post.likeCount = post.likes.length || 0;
      // eslint-disable-next-line no-param-reassign
      post.likedByUser = post.likes.includes(userId);
      return post;
    });
  }

  async findPostsByMovieId(
    movieId: string,
    limit: number,
    activeOnly: boolean,
    before?: mongoose.Types.ObjectId,
    requestingContextUserId?: string,
    ): Promise<FeedPostDocument[]> {
    const feedPostFindAllQuery: any = {};
    const feedPostQuery = [];
    feedPostQuery.push({ movieId: new mongoose.Types.ObjectId(movieId) });
    feedPostQuery.push({ postType: PostType.MovieReview });
    if (requestingContextUserId) {
      const blockUserIds = await this.blocksService.getBlockedUserIdsBySender(requestingContextUserId);
      feedPostQuery.push({ userId: { $nin: blockUserIds } });
    }
    if (before) {
      const feedPost = await this.feedPostModel.findById(before).exec();
      feedPostQuery.push({ createdAt: { $lt: feedPost.createdAt } });
    }
    if (activeOnly) {
      feedPostFindAllQuery.is_deleted = FeedPostDeletionState.NotDeleted;
      feedPostFindAllQuery.status = FeedPostStatus.Active;
      feedPostQuery.push(feedPostFindAllQuery);
    }
    const feedPosts = await this.feedPostModel
      .find({ $and: feedPostQuery })
      .populate('userId', 'userName _id profilePic')
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();

    // return feedPosts
    return JSON.parse(JSON.stringify(feedPosts)).map((post) => {
      // eslint-disable-next-line no-param-reassign
      post.likeCount = post.likes.length || 0;
      // eslint-disable-next-line no-param-reassign
      post.likedByUser = post.likes.includes(requestingContextUserId);
      return post;
    });
  }

  async findMainFeedPostsForUser(
    userId: string,
    limit: number,
    before?: mongoose.Types.ObjectId,
  ): Promise<FeedPostDocument[]> {
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

    const query = await this.feedPostModel
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
          {
            $and: [
              { postType: { $ne: PostType.MovieReview } },
              { postType: { $ne: PostType.News } },
            ],
          },
          { hideUsers: { $ne: new mongoose.Types.ObjectId(userId) } },
          beforeQuery,
        ],
      })
      .populate('userId', '_id userName profilePic')
      .populate('rssfeedProviderId', '_id title logo')
      .sort({ lastUpdateAt: -1 })
      .limit(limit)
      .exec();
    const feedPosts = JSON.parse(JSON.stringify(query)).map((post) => {
      // eslint-disable-next-line no-param-reassign
      post.likedByUser = post.likes.includes(userId);
      // eslint-disable-next-line no-param-reassign
      post.likeCount = post.likes.length || 0;
      return post;
    });
    return feedPosts;
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
          {
            $and: [
              { postType: { $ne: PostType.MovieReview } },
              { postType: { $ne: PostType.News } },
            ],
          },
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
    identifyLikesForUser?: mongoose.Types.ObjectId,
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
    const feedPosts = await this.feedPostModel
      .find({ $and: feedPostQuery })
      .populate('rssfeedProviderId', 'title _id logo')
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();

    return JSON.parse(JSON.stringify(feedPosts)).map((post) => {
      // eslint-disable-next-line no-param-reassign
      post.likedByUser = post.likes.includes(identifyLikesForUser);
      // eslint-disable-next-line no-param-reassign
      post.likeCount = post.likes.length || 0;
      return post;
    });
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

  async getLikeUsersForPost(postId: string, limit: number, offset = 0, requestingContextUserId?: string) {
    type FriendShip = { from?: User, to?: User, friendship?: FriendRequestReaction } | null;
    type LikeUserForPost = {
      _id: mongoose.Schema.Types.ObjectId;
      userName: string;
      profilePic: string;
      firstName: string;
      friendship?: FriendShip;
    };

    const filter: any = [{ feedPostId: postId }];

    if (requestingContextUserId) {
      const blockUserIds = await this.blocksService.getBlockedUserIdsBySender(requestingContextUserId);
      filter.push({ userId: { $nin: blockUserIds } });
    }
    const feedPostLikes = await this.feedLikesModel
      .find({ $and: filter })
      .populate('userId', 'userName firstName profilePic _id')
      .skip(offset)
      .limit(limit);

    // Return empty array if no feedPostLikes documents found in database
    if (feedPostLikes.length === 0) {
      return [];
    }

    const likeUsersForPost: LikeUserForPost[] = [];
    let userIdToFriendRecord;
    if (requestingContextUserId) {
      userIdToFriendRecord = await this.friendsService
        .findFriendshipBulk(requestingContextUserId, feedPostLikes.map((feedPostLike) => feedPostLike.userId._id.toString()));
    }
    feedPostLikes.forEach((feedPostLike) => {
      const feedPostLikeUser = feedPostLike.userId;
      const likeUserForPost: LikeUserForPost = {
        _id: feedPostLikeUser._id,
        userName: feedPostLikeUser.userName,
        profilePic: relativeToFullImagePath(this.configService, feedPostLikeUser.profilePic),
        firstName: feedPostLikeUser.firstName,
      };
      if (requestingContextUserId) {
        const friend = userIdToFriendRecord[feedPostLikeUser._id.toString()];
        const friendship: FriendShip = friend ? pick(friend, ['reaction', 'from', 'to']) : null;
        likeUserForPost.friendship = friendship;
      }
      likeUsersForPost.push(likeUserForPost);
    });

    return likeUsersForPost;
  }

  async findFeedPost(userId: string, movieId: string) {
    const feedPost = await this.feedPostModel
    .findOne({
      $and: [{ userId: new mongoose.Types.ObjectId(userId) }, { movieId: new mongoose.Types.ObjectId(movieId) }],
    })
    .exec();
    return feedPost;
  }
}
