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
    console.log("images", images);
    
    const insertFeedComments = await this.feedCommentModel.create({
      feedPostId: parentFeedPostId,
      userId: userId,
      message: message,
      images: images,
    });
    return insertFeedComments
  }

  async updateFeedComment(feedCommentId: string, message: string): Promise<FeedComment> {
    return this.feedCommentModel
      .findOneAndUpdate({ _id: feedCommentId }, { $set: { message: message } }, { new: true })
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
      userId: userId,
      message: message,
      images: images,
    });
    return insertFeedReply
  }

  async updateFeedReply(feedReplyId: string, message: string): Promise<FeedReply> {
    return this.feedReplyModel
      .findOneAndUpdate({ _id: feedReplyId }, { $set: { message: message } }, { new: true })
      .exec();
  }

  async deleteFeedReply(feedReplyId: string): Promise<void> {
    await this.feedReplyModel
      .updateOne({ _id: feedReplyId }, { $set: { is_deleted: FeedReplyDeletionState.Deleted } }, { new: true })
      .exec();
  }

  async findFeedCommentsWithReplies(parentFeedPostId: string, limit: number, after?: mongoose.Types.ObjectId): Promise<FeedCommentWithReplies[]> {
    let afteCreatedAt: any = {}
    if (after) {
      const afterFeedComment = await this.feedCommentModel.findById(after);
      afteCreatedAt.createdAt = { createdAt: { $gt: afterFeedComment.createdAt } }
    }
    const comments: any = await this.feedCommentModel
      .find({
        $and: [
          { feedPostId: parentFeedPostId },
          { is_deleted: FeedCommentDeletionState.NotDeleted },
          { status: FeedCommentStatus.Active },
          afteCreatedAt,
        ],
      })
      .populate('userId', 'userName _id profilePic')
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();

    comments.forEach((comment) => comment.replies = []);

    const commentIds = comments.map((comment) => comment._id);

    const replies = await this.feedReplyModel
      .find({
        $and: [
          { feedCommentId: { $in: commentIds } },
          { is_deleted: FeedCommentDeletionState.NotDeleted },
          { status: FeedCommentStatus.Active },
        ],
      })
      .populate('userId', 'userName _id profilePic')
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();

      let commentReplies = []
      for(let comment of comments){
        for(let reply of replies){
          if(comment._id === reply.feedCommentId){
            commentReplies.push(comment.replies.push(reply))
          }
        }
      }
      return commentReplies

  }
}
