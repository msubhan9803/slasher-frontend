/* eslint-disable max-lines */
import {
  Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Query, Req, ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
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
import { UsersService } from '../users/providers/users.service';
import { defaultQueryDtoValidationPipeOptions } from '../utils/validation-utils';
import { LikesLimitOffSetDto } from './dto/likes-limit-offset-query.dto';
import { PostType } from '../schemas/feedPost/feedPost.enums';
import { PostAccessService } from '../feed-posts/providers/post-access.service';

@Controller({ path: 'feed-likes', version: ['1'] })
export class FeedLikesController {
  constructor(
    @InjectQueue('notification') private createNotificationQueue: Queue,
    private readonly feedLikesService: FeedLikesService,
    private readonly feedPostsService: FeedPostsService,
    private readonly feedCommentsService: FeedCommentsService,
    private readonly notificationsService: NotificationsService,
    private readonly blocksService: BlocksService,
    private readonly friendsService: FriendsService,
    private readonly usersService: UsersService,
    private readonly postAccessService: PostAccessService,
  ) { }

  @Post('post/:feedPostId')
  async createFeedPostLike(@Req() request: Request, @Param() params: FeedPostsIdDto) {
    const user = getUserFromRequest(request);
    const post = await this.feedPostsService.findById(params.feedPostId, true);

    if (!post) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }
    const feedPostLikeData = await this.feedLikesService.findFeedPostLike(params.feedPostId, user.id);
    if (feedPostLikeData) {
      throw new HttpException('You already like the post', HttpStatus.BAD_REQUEST);
    }
    
    if (!post.rssfeedProviderId) {
      const block = await this.blocksService.blockExistsBetweenUsers(user.id, (post.userId as unknown as User).toString());
      if (block) {
        throw new HttpException('Request failed due to user block.', HttpStatus.FORBIDDEN);
      }
    }
    await this.feedLikesService.createFeedPostLike(params.feedPostId, user.id);
    let postUserId;
    if (!post.rssfeedProviderId) {
      // Create notification for post creator, informing them that a like was added to their post.
      postUserId = (post.userId as any).toString();
    }
    const skipPostCreatorNotification = (
      // Don't send a "liked your post" notification to the post creator if any of
      // the following conditions apply:
      user.id === postUserId
      || post.rssfeedProviderId
    );

    const postTypeMessages = {
      [PostType.MovieReview]: 'liked your movie review',
      [PostType.BookReview]: 'liked your book review',
      default: 'liked your post',
    };
    if (!skipPostCreatorNotification) {
      const notification: any = {};
      notification.userId = postUserId as any;
      notification.feedPostId = { _id: post._id.toString() } as unknown as FeedPost;
      notification.senderId = user._id;
      notification.allUsers = [user._id as any];
      notification.notifyType = NotificationType.UserLikedYourPost;
      notification.notificationMsg = postTypeMessages[post.postType] || postTypeMessages.default;
      await this.createNotificationQueue.add('create-notification', notification);
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
    await this.feedLikesService.deleteFeedPostLike(params.feedPostId, user.id);
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

    const blockData = await this.blocksService.blockExistsBetweenUsers(user.id, comment.userId.toString());
    if (blockData) {
      throw new HttpException('Request failed due to user block (comment owner).', HttpStatus.FORBIDDEN);
    }

    if (!feedPost.rssfeedProviderId) {
      const block = await this.blocksService.blockExistsBetweenUsers(user.id, (feedPost.userId as unknown as User).toString());
      if (block) {
        throw new HttpException('Request failed due to user block (post owner).', HttpStatus.FORBIDDEN);
      }
    }

    await this.feedLikesService.createFeedCommentLike(params.feedCommentId, user.id);

    // Create notification for comment creator, informing them that a like was added to their comment.
    const skipCommentCreatorNotification = (
      // Don't send a "liked your comment" notification to the post creator if any of
      // the following conditions apply:
      user.id === comment.userId.toString()
    );
    if (!skipCommentCreatorNotification) {
      const notification: any = {};
      notification.userId = comment.userId as any;
      notification.feedPostId = { _id: comment.feedPostId } as unknown as FeedPost;
      notification.feedCommentId = { _id: comment._id } as unknown as FeedComment;
      notification.senderId = user._id;
      notification.allUsers = [user._id as any];
      notification.notifyType = NotificationType.UserLikedYourComment;
      notification.notificationMsg = 'liked your comment';

      await this.createNotificationQueue.add('create-notification', notification);
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
    await this.feedLikesService.deleteFeedCommentLike(params.feedCommentId, user.id);
    return { success: true };
  }

  @Post('reply/:feedReplyId')
  async createFeedReplyLike(@Req() request: Request, @Param() params: FeedReplyIdDto) {
    const user = getUserFromRequest(request);
    const reply = await this.feedCommentsService.findFeedReply(params.feedReplyId.toString());
    if (!reply) {
      throw new HttpException('Reply not found', HttpStatus.NOT_FOUND);
    }
    const feedPost = await this.feedPostsService.findById(reply.feedPostId.toString(), true);
    if (!feedPost) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }

    const blockData = await this.blocksService.blockExistsBetweenUsers(user.id, reply.userId.toString());
    if (blockData) {
      throw new HttpException('Request failed due to user block (reply owner).', HttpStatus.FORBIDDEN);
    }

    if (!feedPost.rssfeedProviderId) {
      const block = await this.blocksService.blockExistsBetweenUsers(user.id, (reply.userId as unknown as User).toString());
      if (block) {
        throw new HttpException('Request failed due to user block (post owner).', HttpStatus.FORBIDDEN);
      }
    }

    await this.feedLikesService.createFeedReplyLike(params.feedReplyId, user.id);

    // Create notification for comment creator, informing them that a like was added to their comment.
    const skipCommentCreatorNotification = (
      // Don't send a "liked your reply" notification to the post creator if any of
      // the following conditions apply:
      user.id === reply.userId.toString()
    );
    if (!skipCommentCreatorNotification) {
      const notification: any = {};
      notification.userId = reply.userId as any;
      notification.feedPostId = { _id: reply.feedPostId } as unknown as FeedPost;
      notification.feedCommentId = { _id: reply.feedCommentId } as unknown as FeedComment;
      notification.feedReplyId = reply._id;
      notification.senderId = user._id;
      notification.allUsers = [user._id as any];
      notification.notifyType = NotificationType.UserLikedYourReply;
      notification.notificationMsg = 'liked your reply';

      await this.createNotificationQueue.add('create-notification', notification);
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
    await this.feedLikesService.deleteFeedReplyLike(params.feedReplyId, user.id);
    return { success: true };
  }

  @Get('comment/:feedCommentId/users')
  async getLikeUsersForFeedComment(
    @Req() request: Request,
    @Param() params: FeedCommentsIdDto,
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) query: LikesLimitOffSetDto,
  ) {
    const user = getUserFromRequest(request);
    const comment = await this.feedCommentsService.findFeedComment(params.feedCommentId.toString());
    if (!comment) {
      throw new HttpException('Comment not found', HttpStatus.NOT_FOUND);
    }
    const feedPost = await this.feedPostsService.findByIdWithPopulatedFields(comment.feedPostId.toString(), true);
    if (!feedPost) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }

    const blockData = await this.blocksService.blockExistsBetweenUsers(user.id, comment.userId.toString());
    if (blockData) {
      throw new HttpException('Request failed due to user block (comment owner).', HttpStatus.FORBIDDEN);
    }

    if (!feedPost.rssfeedProviderId) {
      const block = await this.blocksService.blockExistsBetweenUsers(user.id, (feedPost.userId as unknown as User)._id.toString());
      if (block) {
        throw new HttpException('Request failed due to user block (post owner).', HttpStatus.FORBIDDEN);
      }
    }

    if (
      !feedPost.rssfeedProviderId
      && user.id !== (feedPost.userId as unknown as User)._id.toString()
      && (feedPost.userId as unknown as User).profile_status !== ProfileVisibility.Public
    ) {
      const areFriends = await this.friendsService.areFriends(user.id, (feedPost.userId as unknown as User)._id.toString());
      if (!areFriends) {
        throw new HttpException('You must be friends with this user to perform this action.', HttpStatus.FORBIDDEN);
      }
    }

    const data = await this.feedLikesService.getLikeUsersForFeedComment(
      comment,
      query.limit,
      query.offset,
      user._id.toString(),
    );
    return data;
  }

  @Get('reply/:feedReplyId/users')
  async getLikeUsersForFeedReply(
    @Req() request: Request,
    @Param() params: FeedReplyIdDto,
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) query: LikesLimitOffSetDto,
  ) {
    const user = getUserFromRequest(request);
    const reply = await this.feedCommentsService.findFeedReply(params.feedReplyId.toString());
    if (!reply) {
      throw new HttpException('Reply not found', HttpStatus.NOT_FOUND);
    }
    const feedPost = await this.feedPostsService.findByIdWithPopulatedFields(reply.feedPostId.toString(), true);
    if (!feedPost) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }

    const blockData = await this.blocksService.blockExistsBetweenUsers(user.id, reply.userId.toString());
    if (blockData) {
      throw new HttpException('Request failed due to user block (reply owner).', HttpStatus.FORBIDDEN);
    }

    if (!feedPost.rssfeedProviderId) {
      const block = await this.blocksService.blockExistsBetweenUsers(user.id, (feedPost.userId as unknown as User)._id.toString());
      if (block) {
        throw new HttpException('Request failed due to user block (post owner).', HttpStatus.FORBIDDEN);
      }
    }

    if (
      !feedPost.rssfeedProviderId
      && user.id !== (feedPost.userId as unknown as User)._id.toString()
      && (feedPost.userId as unknown as User).profile_status !== ProfileVisibility.Public
    ) {
      const areFriends = await this.friendsService.areFriends(user.id, (feedPost.userId as unknown as User)._id.toString());
      if (!areFriends) {
        throw new HttpException('You must be friends with this user to perform this action.', HttpStatus.FORBIDDEN);
      }
    }

    const data = await this.feedLikesService.getLikeUsersForFeedReply(
      reply,
      query.limit,
      query.offset,
      user._id.toString(),
    );
    return data;
  }
}
