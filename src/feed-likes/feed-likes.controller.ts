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
import { BlocksService } from '../blocks/providers/blocks.service';
import { User } from '../schemas/user/user.schema';
import { ProfileVisibility } from '../schemas/user/user.enums';
import { FriendsService } from '../friends/providers/friends.service';

@Controller('feed-likes')
export class FeedLikesController {
  constructor(
    private readonly feedLikesService: FeedLikesService,
    private readonly feedPostsService: FeedPostsService,
    private readonly feedCommentsService: FeedCommentsService,
    private readonly notificationsService: NotificationsService,
    private readonly blocksService: BlocksService,
    private readonly friendsService: FriendsService,

  ) { }

  @Post('post/:feedPostId')
  async createFeedPostLike(@Req() request: Request, @Param() params: FeedPostsIdDto) {
    const user = getUserFromRequest(request);
    const post = await this.feedPostsService.findById(params.feedPostId, true);
    if (!post) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }
    const block = await this.blocksService.blockExistsBetweenUsers(user.id, (post.userId as unknown as User)._id.toString());
    if (block) {
      throw new HttpException('Request failed due to user block.', HttpStatus.BAD_REQUEST);
    }
    if ((post.userId as unknown as User).profile_status !== ProfileVisibility.Public) {
      const areFriends = await this.friendsService.areFriends(user._id, (post.userId as unknown as User)._id.toString());
      if (!areFriends) {
        throw new HttpException('You are not friends with the given user.', HttpStatus.UNAUTHORIZED);
      }
    }
    await this.feedLikesService.createFeedPostLike(params.feedPostId, user._id);

    // Create notification for post creator, informing them that a like was added to their post.
    const postUserId = (post.userId as any)._id.toString();
    const skipPostCreatorNotification = (
      // Don't send a "liked your post" notification to the post creator if any of
      // the following conditions apply:
      user.id === postUserId
      || post.rssfeedProviderId
    );
    if (!skipPostCreatorNotification) {
      await this.notificationsService.create({
        userId: ({
          _id: postUserId,
          profilePic: (post.userId as any).profilePic,
          userName: (post.userId as any).userName,
        } as any),
        feedPostId: { _id: post._id.toString() } as unknown as FeedPost,
        senderId: user._id.toString(),
        notifyType: NotificationType.UserLikedYourPost,
        notificationMsg: 'liked your post',
      });
    }
    return { success: true };
  }

  @Delete('post/:feedPostId')
  async deleteFeedPostLike(@Req() request: Request, @Param() params: FeedPostsIdDto) {
    const user = getUserFromRequest(request);
    const post = await this.feedPostsService.findById(params.feedPostId, true);
    if (!post) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }
    await this.feedLikesService.deleteFeedPostLike(params.feedPostId, user._id);
    return { success: true };
  }

  @Post('comment/:feedCommentId')
  async createFeedCommentLike(@Req() request: Request, @Param() params: FeedCommentsIdDto) {
    const user = getUserFromRequest(request);
    const comment = await this.feedCommentsService.findFeedComment(params.feedCommentId.toString());
    if (!comment) {
      throw new HttpException('Comment not found', HttpStatus.NOT_FOUND);
    }
    const feedPost = await this.feedPostsService.findById(comment.feedPostId.toString(), true);
    if (!feedPost) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }
    const block = await this.blocksService.blockExistsBetweenUsers(user.id, (feedPost.userId as unknown as User)._id.toString());
    if (block) {
      throw new HttpException('Request failed due to user block.', HttpStatus.BAD_REQUEST);
    }
    const blockData = await this.blocksService.blockExistsBetweenUsers(user.id, comment.userId.toString());
    if (blockData) {
      throw new HttpException('Request failed due to user block.', HttpStatus.BAD_REQUEST);
    }
    if ((feedPost.userId as unknown as User).profile_status !== ProfileVisibility.Public) {
      const areFriends = await this.friendsService.areFriends(user._id, (feedPost.userId as unknown as User)._id.toString());
      if (!areFriends) {
        throw new HttpException('You are not friends with the given user.', HttpStatus.UNAUTHORIZED);
      }
    }
    await this.feedLikesService.createFeedCommentLike(params.feedCommentId, user._id);

    // Create notification for comment creator, informing them that a like was added to their comment.
    const skipCommentCreatorNotification = (
      // Don't send a "liked your comment" notification to the post creator if any of
      // the following conditions apply:
      user.id === comment.userId.toString()
    );
    if (!skipCommentCreatorNotification) {
      await this.notificationsService.create({
        userId: comment.userId as any,
        feedPostId: { _id: comment.feedPostId } as unknown as FeedPost,
        feedCommentId: { _id: comment._id } as unknown as FeedComment,
        senderId: user._id,
        notifyType: NotificationType.UserLikedYourComment,
        notificationMsg: 'liked your comment',
      });
    }
    return { success: true };
  }

  @Delete('comment/:feedCommentId')
  async deleteFeedCommentLike(@Req() request: Request, @Param() params: FeedCommentsIdDto) {
    const user = getUserFromRequest(request);
    const comment = await this.feedCommentsService.findFeedComment(params.feedCommentId.toString());
    if (!comment) {
      throw new HttpException('Comment not found', HttpStatus.NOT_FOUND);
    }
    await this.feedLikesService.deleteFeedCommentLike(params.feedCommentId, user._id);
    return { success: true };
  }

  @Post('reply/:feedReplyId')
  async createFeedReplyLike(@Req() request: Request, @Param() params: FeedReplyIdDto) {
    const user = getUserFromRequest(request);
    const reply = await this.feedCommentsService.findFeedReply(params.feedReplyId.toString());
    if (!reply) {
      throw new HttpException('Reply not found', HttpStatus.NOT_FOUND);
    }
    await this.feedLikesService.createFeedReplyLike(params.feedReplyId, user._id);

    // Create notification for comment creator, informing them that a like was added to their comment.
    const skipCommentCreatorNotification = (
      // Don't send a "liked your reply" notification to the post creator if any of
      // the following conditions apply:
      user.id === reply.userId.toString()
    );
    if (!skipCommentCreatorNotification) {
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

    return { success: true };
  }

  @Delete('reply/:feedReplyId')
  async deleteFeedReplyLike(@Req() request: Request, @Param() params: FeedReplyIdDto) {
    const user = getUserFromRequest(request);
    const reply = await this.feedCommentsService.findFeedReply(params.feedReplyId.toString());
    if (!reply) {
      throw new HttpException('Reply not found', HttpStatus.NOT_FOUND);
    }
    await this.feedLikesService.deleteFeedReplyLike(params.feedReplyId, user._id);
    return { success: true };
  }
}
