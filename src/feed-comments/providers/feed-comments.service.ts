import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Image } from '../../schemas/shared/image.schema';
import { FeedComment, FeedCommentDocument } from '../../schemas/feedComment/feedComment.schema';
import { FeedCommentDeletionState, FeedCommentStatus } from '../../schemas/feedComment/feedComment.enums';
import { FeedReplyDeletionState } from '../../schemas/feedReply/feedReply.enums';
import { FeedReply, FeedReplyDocument } from '../../schemas/feedReply/feedReply.schema';

export interface FeedCommentWithReplies extends FeedComment {
  replies: FeedReply[];
}

@Injectable()
export class FeedCommentsService {
  constructor(
    @InjectModel(FeedComment.name) private feedCommentModel: Model<FeedCommentDocument>,
    @InjectModel(FeedReply.name) private feedReplyModel: Model<FeedReplyDocument>,
  ) { }

  async createFeedComment(parentFeedPostId: string, userId: string, message: string, images: Image[]): Promise<FeedComment> {
    const insertFeedComments = await this.feedCommentModel.create({
      feedPostId: parentFeedPostId,
      userId,
      message,
      images,
    });
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
  }

  async createFeedReply(parentFeedCommentId: string, userId: string, message: string, images: Image[]): Promise<FeedReply> {
    const insertFeedReply = await this.feedReplyModel.create({
      feedCommentId: parentFeedCommentId,
      userId,
      message,
      images,
    });
    return insertFeedReply;
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
      const filterReply = replies.filter((reply) => reply.feedCommentId.toString() === comment._id);
      comment.replies = filterReply;
      commentReplies.push(comment);
    }
    return commentReplies;
  }
}
