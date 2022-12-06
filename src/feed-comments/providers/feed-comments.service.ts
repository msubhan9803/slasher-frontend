import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Image } from '../../schemas/shared/image.schema';
import { FeedComment, FeedCommentDocument } from '../../schemas/feedComment/feedComment.schema';
import { FeedCommentDeletionState, FeedCommentStatus } from '../../schemas/feedComment/feedComment.enums';
import { FeedReplyDeletionState } from '../../schemas/feedReply/feedReply.enums';
import { FeedReply, FeedReplyDocument } from '../../schemas/feedReply/feedReply.schema';
import { FeedPost, FeedPostDocument } from '../../schemas/feedPost/feedPost.schema';

export interface FeedCommentWithReplies extends FeedComment {
  replies: FeedReply[];
}

@Injectable()
export class FeedCommentsService {
  constructor(
    @InjectModel(FeedComment.name) private feedCommentModel: Model<FeedCommentDocument>,
    @InjectModel(FeedReply.name) private feedReplyModel: Model<FeedReplyDocument>,
    @InjectModel(FeedPost.name) private feedPostModel: Model<FeedPostDocument>,
  ) { }

  async createFeedComment(parentFeedPostId: string, userId: string, message: string, images: Image[]): Promise<FeedComment> {
    const insertFeedComments = await this.feedCommentModel.create({
      feedPostId: parentFeedPostId,
      userId,
      message,
      images,
    });
    await this.feedPostModel.updateOne({ _id: parentFeedPostId }, { $inc: { commentCount: 1 } });
    return insertFeedComments;
  }

  async updateFeedComment(feedCommentId: string, message: string): Promise<FeedComment> {
    return this.feedCommentModel
      .findOneAndUpdate({ _id: feedCommentId }, { $set: { message } }, { new: true })
      .exec();
  }

  async deleteFeedComment(feedCommentId: string): Promise<void> {
    await this.feedCommentModel
      .updateOne({ _id: feedCommentId }, { $set: { is_deleted: FeedCommentDeletionState.Deleted } }, { new: true })
      .exec();
    const getFeedPostData = await this.findFeedComment(feedCommentId);
    await this.feedPostModel.updateOne({ _id: getFeedPostData.feedPostId }, { $inc: { commentCount: -1 } });
  }

  async createFeedReply(parentFeedCommentId: string, userId: string, message: string, images: Image[]): Promise<FeedReply> {
    const feedReply = await this.feedReplyModel.create({
      feedCommentId: parentFeedCommentId,
      userId,
      message,
      images,
    });
    // TODO: Uncomment the code below later on.  Right now, the old API only increments post comment
    // count when a FeedComment is added/removed, but not when a FeedReply is added/removed. So for
    // now, to ensure compatibility, we will do the same.
    // const getFeedPostData = await this.findFeedComment(parentFeedCommentId);
    // await this.feedPostModel.updateOne({ _id: getFeedPostData.feedPostId }, { $inc: { commentCount: 1 } });
    return feedReply;
  }

  async updateFeedReply(feedReplyId: string, message: string): Promise<FeedReply> {
    return this.feedReplyModel
      .findOneAndUpdate({ _id: feedReplyId }, { $set: { message } }, { new: true })
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
    before?: mongoose.Types.ObjectId,
  ): Promise<FeedCommentWithReplies[]> {
    //after == feedCommentId
    const beforeCreatedAt: any = {};
    if (before) {
      const beforeFeedComment = await this.feedCommentModel.findById(before);
      beforeCreatedAt.createdAt = { $lt: beforeFeedComment.createdAt };
    }
    const comments: any = await this.feedCommentModel
      .find({
        $and: [
          { feedPostId: parentFeedPostId },
          { is_deleted: FeedCommentDeletionState.NotDeleted },
          { status: FeedCommentStatus.Active },
          beforeCreatedAt,
        ],
      })
      .populate('userId', 'userName _id profilePic')
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
    const addRepliesKey = JSON.parse(JSON.stringify(comments)).map((e) => {
      e.replies = [];
      return e;
    });
    const commentIds = comments.map((comment) => comment._id);
    const replies = await this.feedReplyModel
      .find({
        feedCommentId: { $in: commentIds },
        deleted: FeedCommentDeletionState.NotDeleted,
        status: FeedCommentStatus.Active,
      })
      .populate('userId', 'userName _id profilePic')
      .sort({ createdAt: 1 })
      .limit(limit)
      .exec();
    const commentReplies = [];
    for (const comment of addRepliesKey) {
      const filterReply = JSON.parse(JSON.stringify(replies)).filter((reply) => {
        if (reply.feedCommentId.toString() === comment._id) {
        // eslint-disable-next-line no-param-reassign
          reply.likeCount = reply.likes.length;
        // eslint-disable-next-line no-param-reassign
          delete reply.likes;
          return reply;
        }
      });
      comment.replies = filterReply;
      comment.likeCount = comment.likes.length;
      delete comment.likes;
      commentReplies.push(comment);
    }
    return commentReplies;
  }

  async findFeedComment(id: string) {
    const feedComment = await this.feedCommentModel
      .findOne({ _id: id })
      .exec();
    return feedComment;
  }

  async findFeedReply(id: string) {
    const feedReply = await this.feedReplyModel
      .findOne({ _id: id })
      .exec();
    return feedReply;
  }
}
