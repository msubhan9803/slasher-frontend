import { Injectable } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { FeedPostLike, FeedPostLikeDocument } from '../../schemas/feedPostLike/feedPostLike.schema';
import { FeedPostsService } from '../../feed-posts/providers/feed-posts.service';
import { NotFoundError } from '../../errors';
import { FeedPost, FeedPostDocument } from '../../schemas/feedPost/feedPost.schema';
import { FeedComment, FeedCommentDocument } from '../../schemas/feedComment/feedComment.schema';
import { FeedReply, FeedReplyDocument } from '../../schemas/feedReply/feedReply.schema';
import { FeedReplyLike, FeedReplyLikeDocument } from '../../schemas/feedReplyLike/feedReplyLike.schema';

@Injectable()
export class FeedLikesService {
  constructor(
    @InjectConnection() private readonly connection: mongoose.Connection,
    @InjectModel(FeedPostLike.name) private feedLikesModel: Model<FeedPostLikeDocument>,
    @InjectModel(FeedPost.name) private feedPostsModel: Model<FeedPostDocument>,
    @InjectModel(FeedComment.name) private feedCommentModel: Model<FeedCommentDocument>,
    @InjectModel(FeedReply.name) private feedReplyModel: Model<FeedReplyDocument>,
    @InjectModel(FeedReplyLike.name) private feedReplyLikeModel: Model<FeedReplyLikeDocument>,
    private readonly feedPostsService: FeedPostsService,
  ) { }

  async createFeedPostLike(feedPostId: string, userId: string): Promise<void> {
    const feedPostDetails = await this.feedPostsService.findById(feedPostId, false);
    if (!feedPostDetails) {
      throw new NotFoundError('Post not found.');
    }
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    await this.feedPostsModel.updateOne(
      { _id: new mongoose.Types.ObjectId(feedPostId) },
      { $addToSet: { likes: userId }, $inc: { likeCount: 1 } },
    );
    await this.feedLikesModel.create({ feedPostId, userId });
    transactionSession.endSession();
  }

  async deleteFeedPostLike(feedPostId: string, userId: string): Promise<void> {
    const feedPostDetails = await this.feedPostsService.findById(feedPostId, false);
    if (!feedPostDetails) {
      throw new NotFoundError('Post not found.');
    }
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    await this.feedPostsModel.updateOne(
      { _id: new mongoose.Types.ObjectId(feedPostId) },
      { $pull: { likes: userId }, $inc: { likeCount: -1 } },
    );
    await this.feedLikesModel.deleteOne({ feedPostId, userId });
    transactionSession.endSession();
  }

  async createFeedCommentLike(feedCommentId: string, userId: string): Promise<void> {
    const feedCommentsDetails = await this.feedCommentModel.findById({ _id: feedCommentId });
    if (!feedCommentsDetails) {
      throw new NotFoundError('Comment not found.');
    }
    await this.feedCommentModel.updateOne(
      { _id: new mongoose.Types.ObjectId(feedCommentId) },
      { $addToSet: { likes: userId } },
    );
  }

  async deleteFeedCommentLike(feedCommentId: string, userId: string): Promise<void> {
    const feedCommentsDetails = await this.feedCommentModel.findById({ _id: feedCommentId });
    if (!feedCommentsDetails) {
      throw new NotFoundError('Comment not found.');
    }
    await this.feedCommentModel.updateOne(
      { _id: new mongoose.Types.ObjectId(feedCommentId) },
      { $pull: { likes: userId } },
    );
  }

  async createFeedReplyLike(feedReplyId: string, userId: string): Promise<void> {
    const feedReplyDetails = await this.feedReplyModel.findById({ _id: feedReplyId });
    if (!feedReplyDetails) {
      throw new NotFoundError('Reply not found.');
    }
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    await this.feedReplyModel.updateOne(
      { _id: new mongoose.Types.ObjectId(feedReplyId) },
      { $addToSet: { likes: userId } },
    );
    await this.feedReplyLikeModel.create({ feedReplyId, userId });
    transactionSession.endSession();
  }

  async deleteFeedReplyLike(feedReplyId: string, userId: string): Promise<void> {
    const feedReplyDetails = await this.feedReplyModel.findById({ _id: feedReplyId });
    if (!feedReplyDetails) {
      throw new NotFoundError('Reply not found.');
    }
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    await this.feedReplyModel.updateOne(
      { _id: new mongoose.Types.ObjectId(feedReplyId) },
      { $pull: { likes: userId } },
    );
    await this.feedReplyLikeModel.create({ feedReplyId, userId });
    transactionSession.endSession();
  }
}
