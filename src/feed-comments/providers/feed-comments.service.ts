import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { FeedComment, FeedCommentDocument } from '../../schemas/feedComment/feedComment.schema';
import { FeedCommentDeletionState, FeedCommentStatus } from '../../schemas/feedComment/feedComment.enums';
import { FeedReplyDeletionState } from '../../schemas/feedReply/feedReply.enums';
import { FeedReply, FeedReplyDocument } from '../../schemas/feedReply/feedReply.schema';
import { FeedPostsService } from '../../feed-posts/providers/feed-posts.service';
import { CommentsSortByType } from '../../types';

export interface FeedCommentWithReplies extends FeedComment {
  replies: FeedReply[];
}

@Injectable()
export class FeedCommentsService {
  constructor(
    @InjectModel(FeedComment.name) private feedCommentModel: Model<FeedCommentDocument>,
    @InjectModel(FeedReply.name) private feedReplyModel: Model<FeedReplyDocument>,
    private feedPostService: FeedPostsService,
  ) { }

  async createFeedComment(feedCommentData: Partial<FeedComment>): Promise<FeedCommentDocument> {
    const insertFeedComments = await this.feedCommentModel.create(feedCommentData);
    await this.feedPostService.incrementCommentCount(insertFeedComments.feedPostId.toString());

    return insertFeedComments;
  }

  async updateFeedComment(feedCommentId: string, feedCommentData: Partial<FeedComment>): Promise<FeedComment> {
    return this.feedCommentModel
      .findOneAndUpdate({ _id: feedCommentId }, feedCommentData, { new: true })
      .exec();
  }

  async deleteFeedComment(feedCommentId: string): Promise<void> {
    await Promise.all([
      this.feedCommentModel
        .updateOne({ _id: feedCommentId }, { $set: { is_deleted: FeedCommentDeletionState.Deleted } }, { new: true })
        .exec(),
      this.feedReplyModel
        .updateMany({ feedCommentId }, { $set: { deleted: FeedReplyDeletionState.Deleted } })
        .exec(),
    ]);
    const getFeedPostData = await this.findFeedComment(feedCommentId);
    await this.feedPostService.decrementCommentCount(getFeedPostData.feedPostId.toString());
  }

  async createFeedReply(feedReplyData: Partial<FeedReply>): Promise<FeedReplyDocument> {
    const feedComment = await this.findFeedComment(feedReplyData.feedCommentId.toString());
    if (!feedComment) {
      throw new Error(`Comment with id ${feedReplyData.feedCommentId.toString()} not found`);
    }
    // eslint-disable-next-line no-param-reassign
    feedReplyData.feedPostId = feedComment.feedPostId;
    const feedReply = await this.feedReplyModel.create(feedReplyData);
    // TODO: Uncomment the code below later on.  Right now, the old API only increments post comment
    // count when a FeedComment is added/removed, but not when a FeedReply is added/removed. So for
    // now, to ensure compatibility, we will do the same.
    // const getFeedPostData = await this.findFeedComment(parentFeedCommentId);
    // await this.feedPostModel.updateOne({ _id: getFeedPostData.feedPostId }, { $inc: { commentCount: 1 } });
    return feedReply;
  }

  async updateFeedReply(feedReplyId: string, feedReplyData: Partial<FeedReply>): Promise<FeedReply> {
    return this.feedReplyModel
      .findOneAndUpdate({ _id: feedReplyId }, feedReplyData, { new: true })
      .exec();
  }

  async deleteFeedReply(feedReplyId: string): Promise<void> {
    await this.feedReplyModel
      .updateOne({ _id: feedReplyId }, { $set: { deleted: FeedReplyDeletionState.Deleted } }, { new: true })
      .exec();
    // TODO: Uncomment the code below later on.  Right now, the old API only increments post comment
    // count when a FeedComment is added/removed, but not when a FeedReply is added/removed. So for
    // now, to ensure compatibility, we will do the same.
    // const getFeedReplyData = await this.findFeedReply(feedReplyId);
    // const getFeedPostData = await this.findFeedComment(getFeedReplyData.feedCommentId.toString());
    // await this.feedPostModel.updateOne({ _id: getFeedPostData.feedPostId }, { $inc: { commentCount: -1 } });
  }

  async findFeedCommentsWithReplies(
    parentFeedPostId: string,
    limit: number,
    sortBy: CommentsSortByType,
    excludeUserIds: string[],
    identifyLikesForUser?: mongoose.Types.ObjectId,
    after?: mongoose.Types.ObjectId,
  ): Promise<FeedCommentWithReplies[]> {
    const sortClause: any = {
      createdAt: (sortBy === 'newestFirst' ? -1 : 1),
    };
    const queryForAfterFilter: any = {};
    if (after) {
      const feedCommentForAfterFilter = await this.feedCommentModel.findById(after);
      if (sortBy === 'newestFirst') {
        queryForAfterFilter.createdAt = { $lt: feedCommentForAfterFilter.createdAt };
      } else {
        queryForAfterFilter.createdAt = { $gt: feedCommentForAfterFilter.createdAt };
      }
    }
    const comments: any = await this.feedCommentModel
      .find({
        $and: [
          { feedPostId: parentFeedPostId },
          { is_deleted: FeedCommentDeletionState.NotDeleted },
          { status: FeedCommentStatus.Active },
          { userId: { $nin: excludeUserIds } },
          queryForAfterFilter,
        ],
      })
      .populate('userId', 'userName _id profilePic')
      .sort(sortClause)
      .limit(limit)
      .exec();
    const addRepliesKey = JSON.parse(JSON.stringify(comments)).map((commentLike) => {
      // eslint-disable-next-line no-param-reassign
      commentLike.likedByUser = commentLike.likes.includes(identifyLikesForUser);
      // eslint-disable-next-line no-param-reassign
      commentLike.replies = [];
      return commentLike;
    });
    const commentIds = comments.map((comment) => comment._id);
    const replies = await this.feedReplyModel
      .find({
        feedCommentId: { $in: commentIds },
        userId: { $nin: excludeUserIds },
        deleted: FeedCommentDeletionState.NotDeleted,
        status: FeedCommentStatus.Active,
      })
      .populate('userId', 'userName _id profilePic')
      .sort({ createdAt: 1 }) // replies are always sorted by { createdAt: 1 }, regardless of comment sort
      .exec();
    const commentReplies = [];
    for (const comment of addRepliesKey) {
      const filterReply = replies.filter((reply) => reply.feedCommentId.toString() === comment._id);
      const addLikedByUser = JSON.parse(JSON.stringify(filterReply)).map((userLike) => {
        // eslint-disable-next-line no-param-reassign
        userLike.likedByUser = userLike.likes.includes(identifyLikesForUser);
        return userLike;
      });
      comment.replies = addLikedByUser;
      commentReplies.push(comment);
    }
    return commentReplies;
  }

  async findFeedComment(id: string, populateUser = false) {
    const unexecutedQuery = this.feedCommentModel.findOne({ _id: id });
    if (populateUser) { unexecutedQuery.populate('userId', 'userName'); }
    return unexecutedQuery.exec();
  }

  async findFeedReply(id: string, populateUser = false) {
    const unexecutedQuery = this.feedReplyModel.findOne({ _id: id });
    if (populateUser) { unexecutedQuery.populate('userId', 'userName'); }
    return unexecutedQuery.exec();
  }

  async findOneFeedCommentWithReplies(
    feedCommentId: string,
    activeOnly: boolean,
    excludeUserIds: string[],
    identifyLikesForUser?: mongoose.Types.ObjectId,
  ): Promise<FeedCommentWithReplies> {
    const commentAndReplyQuery: any = { _id: feedCommentId, userId: { $nin: excludeUserIds } };
    if (activeOnly) {
      commentAndReplyQuery.is_deleted = FeedCommentDeletionState.NotDeleted;
      commentAndReplyQuery.status = FeedCommentStatus.Active;
    }
    const feedComment = await this.feedCommentModel
      .findOne(commentAndReplyQuery)
      .populate('userId', 'userName _id profilePic')
      .exec();
    if (!feedComment) {
      return null;
    }
    const feedCommentData = JSON.parse(JSON.stringify(feedComment));
    feedCommentData.likedByUser = feedCommentData.likes.includes(identifyLikesForUser);
    const feedReply = await this.feedReplyModel
      .find({
        feedCommentId: feedCommentData._id,
        userId: { $nin: excludeUserIds },
        deleted: FeedCommentDeletionState.NotDeleted,
        status: FeedCommentStatus.Active,
      })
      .populate('userId', 'userName _id profilePic')
      .sort({ createdAt: 1 })
      .exec();
    const feedReplyData = JSON.parse(JSON.stringify(feedReply)).map((reply) => {
      // eslint-disable-next-line no-param-reassign
      reply.likedByUser = reply.likes.includes(identifyLikesForUser);
      return reply;
    });
    feedCommentData.replies = feedReplyData;
    return feedCommentData;
  }
}
