import {
  Controller, Delete, HttpException, HttpStatus, Param, Post, Req,
} from '@nestjs/common';
import { Request } from 'express';
import { getUserFromRequest } from '../utils/request-utils';
import { FeedLikesService } from './providers/feed-likes.service';
import { FeedPostsIdDto } from './dto/feed-post-id.dto';
import { FeedPostsService } from '../feed-posts/providers/feed-posts.service';
import { FeedCommentsService } from '../feed-comments/providers/feed-comments.service';
import { FeedReplyIdDto } from '../feed-comments/dto/feed-reply-id.dto';
import { FeedCommentsIdDto } from '../feed-comments/dto/feed-comment-id-dto';
import { NotificationsService } from '../notifications/providers/notifications.service';
import { FeedComment } from '../schemas/feedComment/feedComment.schema';
import { FeedPost } from '../schemas/feedPost/feedPost.schema';
import { NotificationType } from '../schemas/notification/notification.enums';

@Controller('feed-likes')
export class FeedLikesController {
  constructor(
    private readonly feedLikesService: FeedLikesService,
    private readonly feedPostsService: FeedPostsService,
    private readonly feedCommentsService: FeedCommentsService,
    private readonly notificationsService: NotificationsService,
  ) { }

  @Post('post/:feedPostId')
  async createFeedPostLike(@Req() request: Request, @Param() params: FeedPostsIdDto) {
    const user = getUserFromRequest(request);
    const post = await this.feedPostsService.findById(params.feedPostId, true);
    if (!post) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }
    await this.feedLikesService.createFeedPostLike(params.feedPostId, user._id);

    await this.notificationsService.create({
      userId: post.userId as any,
      feedPostId: { _id: post._id } as unknown as FeedPost,
      senderId: user._id,
      notifyType: NotificationType.UserLikedYourPost,
      notificationMsg: 'liked your post',
    });
  }

  @Delete('post/:feedPostId')
  async deleteFeedPostLike(@Req() request: Request, @Param() params: FeedPostsIdDto) {
    const user = getUserFromRequest(request);
    const post = await this.feedPostsService.findById(params.feedPostId, true);
    if (!post) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }
    await this.feedLikesService.deleteFeedPostLike(params.feedPostId, user._id);
  }

  @Post('comment/:feedCommentId')
  async createFeedCommentLike(@Req() request: Request, @Param() params: FeedCommentsIdDto) {
    const user = getUserFromRequest(request);
    const comment = await this.feedCommentsService.findFeedComment(params.feedCommentId.toString());
    if (!comment) {
      throw new HttpException('Comment not found', HttpStatus.NOT_FOUND);
    }
    await this.feedLikesService.createFeedCommentLike(params.feedCommentId, user._id);

    await this.notificationsService.create({
      userId: comment.userId as any,
      feedPostId: { _id: comment.feedPostId } as unknown as FeedPost,
      feedCommentId: { _id: comment._id } as unknown as FeedComment,
      senderId: user._id,
      notifyType: NotificationType.UserLikedYourComment,
      notificationMsg: 'liked your comment',
    });
  }

  @Delete('comment/:feedCommentId')
  async deleteFeedCommentLike(@Req() request: Request, @Param() params: FeedCommentsIdDto) {
    const user = getUserFromRequest(request);
    const comment = await this.feedCommentsService.findFeedComment(params.feedCommentId.toString());
    if (!comment) {
      throw new HttpException('Comment not found', HttpStatus.NOT_FOUND);
    }
    await this.feedLikesService.deleteFeedCommentLike(params.feedCommentId, user._id);
  }

  @Post('reply/:feedReplyId')
  async createFeedReplyLike(@Req() request: Request, @Param() params: FeedReplyIdDto) {
    const user = getUserFromRequest(request);
    const reply = await this.feedCommentsService.findFeedReply(params.feedReplyId.toString());
    if (!reply) {
      throw new HttpException('Reply not found', HttpStatus.NOT_FOUND);
    }
    await this.feedLikesService.createFeedReplyLike(params.feedReplyId, user._id);

    await this.notificationsService.create({
      userId: reply.userId as any,
      feedPostId: { _id: reply.feedPostId } as unknown as FeedPost,
      feedCommentId: { _id: reply.feedCommentId } as unknown as FeedComment,
      feedReplyId: reply._id,
      senderId: user._id,
      notifyType: NotificationType.UserMentionedYouInAComment_MentionedYouInACommentReply_LikedYourReply_RepliedOnYourPost,
      notificationMsg: 'liked your reply',
    });
  }

  @Delete('reply/:feedReplyId')
  async deleteFeedReplyLike(@Req() request: Request, @Param() params: FeedReplyIdDto) {
    const user = getUserFromRequest(request);
    const reply = await this.feedCommentsService.findFeedReply(params.feedReplyId.toString());
    if (!reply) {
      throw new HttpException('Reply not found', HttpStatus.NOT_FOUND);
    }
    await this.feedLikesService.deleteFeedReplyLike(params.feedReplyId, user._id);
  }
}
