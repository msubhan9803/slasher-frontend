import { Injectable } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { FeedPostLike, FeedPostLikeDocument } from '../../schemas/feedPostLike/feedPostLike.schema';
import { FeedPostsService } from '../../feed-posts/providers/feed-posts.service';
import { FeedComment, FeedCommentDocument } from '../../schemas/feedComment/feedComment.schema';
import { FeedReply, FeedReplyDocument } from '../../schemas/feedReply/feedReply.schema';
import { FeedReplyLike, FeedReplyLikeDocument } from '../../schemas/feedReplyLike/feedReplyLike.schema';
import { BlocksService } from '../../blocks/providers/blocks.service';
import { User, UserDocument } from '../../schemas/user/user.schema';
import { FriendsService } from '../../friends/providers/friends.service';
import { relativeToFullImagePath } from '../../utils/image-utils';
import { pick } from '../../utils/object-utils';
import { LikeUserAndFriendship } from '../../types';

@Injectable()
export class FeedLikesService {
  constructor(
    @InjectConnection() private readonly connection: mongoose.Connection,
    @InjectModel(FeedPostLike.name) private feedLikesModel: Model<FeedPostLikeDocument>,
    @InjectModel(FeedComment.name) private feedCommentModel: Model<FeedCommentDocument>,
    @InjectModel(FeedReply.name) private feedReplyModel: Model<FeedReplyDocument>,
    @InjectModel(FeedReplyLike.name) private feedReplyLikeModel: Model<FeedReplyLikeDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly feedPostsService: FeedPostsService,
    private readonly blocksService: BlocksService,
    private readonly friendsService: FriendsService,
    private configService: ConfigService,
  ) { }

  async createFeedPostLike(feedPostId: string, userId: string): Promise<void> {
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    await Promise.all([this.feedPostsService.addLike(feedPostId, userId),
    this.feedLikesModel.create({ feedPostId, userId })]);
    transactionSession.endSession();
  }

  async findFeedPostLike(feedPostId: string, userId: string): Promise<FeedPostLikeDocument> {
    return this.feedLikesModel.findOne({ feedPostId, userId }).exec();
  }

  async deleteFeedPostLike(feedPostId: string, userId: string): Promise<void> {
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    await this.feedPostsService.removeLike(feedPostId, userId);
    await this.feedLikesModel.deleteOne({ feedPostId, userId });
    transactionSession.endSession();
  }

  async createFeedCommentLike(feedCommentId: string, userId: string): Promise<void> {
    await this.feedCommentModel.updateOne(
      { _id: new mongoose.Types.ObjectId(feedCommentId) },
      { $addToSet: { likes: new mongoose.Types.ObjectId(userId) } },
    );
  }

  async deleteFeedCommentLike(feedCommentId: string, userId: string): Promise<void> {
    await this.feedCommentModel.updateOne(
      { _id: new mongoose.Types.ObjectId(feedCommentId) },
      { $pull: { likes: new mongoose.Types.ObjectId(userId) } },
    );
  }

  async getLikeUsersForFeedComment(feedCommentsDetails: FeedComment, limit: number, offset = 0, requestingContextUserId?: string) {
    // Do not return likes by blocked users
    let blockUserIds = [];
    if (requestingContextUserId) {
      blockUserIds = await this.blocksService.getUserIdsForBlocksToOrFromUser(requestingContextUserId);
    }

    const users = await this.userModel.find({
      _id: { $in: feedCommentsDetails.likes, $nin: blockUserIds },
    })
      .select('userName firstName profilePic _id')
      .skip(offset)
      .limit(limit)
      .sort({ _id: 1 });

    // Return empty array if no user documents found in database
    if (users.length === 0) {
      return [];
    }

    let userIdToFriendRecord;
    if (requestingContextUserId) {
      userIdToFriendRecord = await this.friendsService
        .findFriendshipBulk(requestingContextUserId, users.map((u) => u._id.toString()));
    }

    const likeUsersForComment: LikeUserAndFriendship[] = users.map((u) => {
      const likeUserForComment: LikeUserAndFriendship = {
        _id: u._id,
        userName: u.userName,
        profilePic: relativeToFullImagePath(this.configService, u.profilePic),
        firstName: u.firstName,
      };

      if (requestingContextUserId) {
        const friend = userIdToFriendRecord[u._id.toString()];
        likeUserForComment.friendship = friend ? pick(friend, ['reaction', 'from', 'to']) : null;
      }
      return likeUserForComment;
    });

    return likeUsersForComment;
  }

  async createFeedReplyLike(feedReplyId: string, userId: string): Promise<void> {
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    await this.feedReplyModel.updateOne(
      { _id: new mongoose.Types.ObjectId(feedReplyId) },
      { $addToSet: { likes: new mongoose.Types.ObjectId(userId) } },
    );
    await this.feedReplyLikeModel.findOneAndUpdate({ feedReplyId, userId }, {}, { upsert: true, new: true });
    transactionSession.endSession();
  }

  async deleteFeedReplyLike(feedReplyId: string, userId: string): Promise<void> {
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    await this.feedReplyModel.updateOne(
      { _id: new mongoose.Types.ObjectId(feedReplyId) },
      { $pull: { likes: new mongoose.Types.ObjectId(userId) } },
    );
    await this.feedReplyLikeModel.deleteOne({ feedReplyId, userId });
    transactionSession.endSession();
  }

  async getLikeUsersForFeedReply(feedReplyDetails: FeedReply, limit: number, offset = 0, requestingContextUserId?: string) {
    // const feedReplyDetails = await this.feedReplyModel.findById({ _id: feedReplyId });
    // if (!feedReplyDetails) {
    //   throw new NotFoundError('Reply not found.');
    // }
    const feedReplyId = feedReplyDetails._id;
    const filter: any = [{ feedReplyId }];

    // Do not return likes by blocked users
    if (requestingContextUserId) {
      const blockUserIds = await this.blocksService.getUserIdsForBlocksToOrFromUser(requestingContextUserId);
      filter.push({ userId: { $nin: blockUserIds } });
    }

    const feedReplyLikes = await this.feedReplyLikeModel
      .find({ $and: filter })
      .populate('userId', 'userName firstName profilePic _id')
      .skip(offset)
      .limit(limit)
      .sort({ _id: 1 });

    // Return empty array if no feedReplyLikes documents found in database
    if (feedReplyLikes.length === 0) {
      return [];
    }

    let userIdToFriendRecord;
    if (requestingContextUserId) {
      userIdToFriendRecord = await this.friendsService
        .findFriendshipBulk(requestingContextUserId, feedReplyLikes.map((feedReplyLike) => feedReplyLike.userId._id.toString()));
    }
    const likeUsersForReply: LikeUserAndFriendship[] = feedReplyLikes.map((feedReplyLike) => {
      const feedReplyLikeUser = feedReplyLike.userId;
      const likeUserForReply: LikeUserAndFriendship = {
        _id: feedReplyLikeUser._id,
        userName: feedReplyLikeUser.userName,
        profilePic: relativeToFullImagePath(this.configService, feedReplyLikeUser.profilePic),
        firstName: feedReplyLikeUser.firstName,
      };
      if (requestingContextUserId) {
        const friend = userIdToFriendRecord[feedReplyLikeUser._id.toString()];
        likeUserForReply.friendship = friend ? pick(friend, ['reaction', 'from', 'to']) : null;
      }
      return likeUserForReply;
    });

    return likeUsersForReply;
  }

  async deleteAllFeedPostLikeByUserId(id: string): Promise<void> {
    await this.feedLikesModel.deleteMany({ userId: new mongoose.Types.ObjectId(id) }).exec();
  }

  async deleteAllFeedReplyLikeByUserId(id: string): Promise<void> {
    await this.feedReplyLikeModel.deleteMany({ userId: new mongoose.Types.ObjectId(id) }).exec();
  }
}
