/* eslint-disable max-lines */
import {
  Controller, HttpStatus, Post, UseInterceptors, Body, UploadedFiles, HttpException, Param, Patch, Delete, Query, Get, ValidationPipe, Req,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import mongoose from 'mongoose';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { S3StorageService } from '../local-storage/providers/s3-storage.service';
import { LocalStorageService } from '../local-storage/providers/local-storage.service';
import { FeedCommentsService } from './providers/feed-comments.service';
import { MAXIMUM_IMAGE_UPLOAD_SIZE } from '../constants';
import { CreateFeedCommentsDto } from './dto/create-feed-comments.dto';
import { UpdateFeedCommentsDto } from './dto/update-feed-comments.dto';
import { CreateFeedReplyDto } from './dto/create-feed-reply.dto';
import { UpdateFeedReplyDto } from './dto/update-feed-reply.dto';
import { defaultQueryDtoValidationPipeOptions } from '../utils/validation-utils';
import { GetFeedCommentsDto } from './dto/get-feed-comments.dto';
import { FeedCommentsIdDto } from './dto/feed-comment-id-dto';
import { FeedReplyIdDto } from './dto/feed-reply-id.dto';
import { getUserFromRequest } from '../utils/request-utils';
import { TransformImageUrls } from '../app/decorators/transform-image-urls.decorator';
import { StorageLocationService } from '../global/providers/storage-location.service';
import { NotificationType } from '../schemas/notification/notification.enums';
import { extractUserMentionIdsFromMessage } from '../utils/text-utils';
import { NotificationsService } from '../notifications/providers/notifications.service';
import { FeedPost } from '../schemas/feedPost/feedPost.schema';
import { FeedComment } from '../schemas/feedComment/feedComment.schema';
import { FeedPostsService } from '../feed-posts/providers/feed-posts.service';
import { BlocksService } from '../blocks/providers/blocks.service';
import { pick } from '../utils/object-utils';
import { ProfileVisibility } from '../schemas/user/user.enums';
import { FriendsService } from '../friends/providers/friends.service';
import { User } from '../schemas/user/user.schema';

@Controller('feed-comments')
export class FeedCommentsController {
  constructor(
    private readonly feedPostsService: FeedPostsService,
    private readonly feedCommentsService: FeedCommentsService,
    private readonly localStorageService: LocalStorageService,
    private readonly notificationsService: NotificationsService,
    private readonly storageLocationService: StorageLocationService,
    private readonly config: ConfigService,
    private readonly s3StorageService: S3StorageService,
    private readonly blocksService: BlocksService,
    private readonly friendsService: FriendsService,
  ) { }

  @Post()
  @UseInterceptors(
    FilesInterceptor('images', 5, {
      fileFilter: (req, file, cb) => {
        if (
          !file.mimetype.includes('image/png')
          && !file.mimetype.includes('image/jpeg')
          && !file.mimetype.includes('image/gif')
        ) {
          return cb(new HttpException(
            'Invalid file type',
            HttpStatus.BAD_REQUEST,
          ), false);
        }
        return cb(null, true);
      },
      limits: {
        fileSize: MAXIMUM_IMAGE_UPLOAD_SIZE,
      },
    }),
  )
  async createFeedComment(
    @Req() request: Request,
    @Body() createFeedCommentsDto: CreateFeedCommentsDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    const post = await this.feedPostsService.findById(createFeedCommentsDto.feedPostId, true);
    if (!post) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }

    if (files.length > 4) {
      throw new HttpException(
        'Only allow a maximum of 4 images',
        HttpStatus.BAD_REQUEST,
      );
    }
    const user = getUserFromRequest(request);
    const block = await this.blocksService.blockExistsBetweenUsers(user.id, (post.userId as unknown as User)._id.toString());
    if (block) {
      throw new HttpException('Request failed due to user block.', HttpStatus.BAD_REQUEST);
    }
    if ((post.userId as any).profile_status !== ProfileVisibility.Public) {
      const areFriends = await this.friendsService.areFriends(user._id, (post.userId as unknown as User)._id.toString());
      if (!areFriends) {
        throw new HttpException('You are not friends with the given user.', HttpStatus.UNAUTHORIZED);
      }
    }
    const images = [];
    for (const file of files) {
      const storageLocation = this.storageLocationService.generateNewStorageLocationFor('feed', file.filename);
      if (this.config.get<string>('FILE_STORAGE') === 's3') {
        await this.s3StorageService.write(storageLocation, file);
      } else {
        this.localStorageService.write(storageLocation, file);
      }
      images.push({ image_path: storageLocation });
    }

    const comment = await this.feedCommentsService.createFeedComment(
      createFeedCommentsDto.feedPostId,
      user.id,
      createFeedCommentsDto.message,
      images,
    );

    // Create notification for post creator, informing them that a comment was added to their post.
    // But don't send a notification to the creator if this is an rss feed post.
    if (!post.rssfeedProviderId) {
      await this.notificationsService.create({
        userId: post.userId as any,
        feedPostId: { _id: comment.feedPostId } as unknown as FeedPost,
        feedCommentId: { _id: comment._id } as unknown as FeedComment,
        senderId: user._id,
        notifyType: NotificationType.UserCommentedOnYourPost,
        notificationMsg: 'commented on your post',
      });
    }
    // Create notifications if any users were mentioned
    const mentionedUserIds = extractUserMentionIdsFromMessage(comment?.message);
    for (const mentionedUserId of mentionedUserIds) {
      await this.notificationsService.create({
        userId: new mongoose.Types.ObjectId(mentionedUserId) as any,
        feedPostId: { _id: comment.feedPostId } as unknown as FeedPost,
        feedCommentId: { _id: comment._id } as unknown as FeedComment,
        senderId: user._id,
        notifyType: NotificationType.UserMentionedYouInAComment_MentionedYouInACommentReply_LikedYourReply_RepliedOnYourPost,
        notificationMsg: 'mentioned you in a comment',
      });
    }

    return {
      _id: comment._id,
      feedPostId: comment.feedPostId,
      message: comment.message,
      userId: comment.userId,
      images: comment.images,
    };
  }

  @Patch(':feedCommentId')
  async updateFeedComment(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: FeedCommentsIdDto,
    @Body() updateFeedCommentsDto: UpdateFeedCommentsDto,
  ) {
    const user = getUserFromRequest(request);
    const comment = await this.feedCommentsService.findFeedComment(params.feedCommentId);
    if (!comment) {
      throw new HttpException('Not found.', HttpStatus.NOT_FOUND);
    }

    if (comment.userId.toString() !== user.id) {
      throw new HttpException('Permission denied.', HttpStatus.FORBIDDEN);
    }

    const mentionedUserIdsBeforeUpdate = extractUserMentionIdsFromMessage(comment.message);
    const updatedComment = await this.feedCommentsService.updateFeedComment(params.feedCommentId, updateFeedCommentsDto.message);
    const mentionedUserIdsAfterUpdate = extractUserMentionIdsFromMessage(updatedComment?.message);

    // Create notifications if any NEW users were mentioned after the edit
    const newMentionedUserIds = mentionedUserIdsAfterUpdate.filter((x) => !mentionedUserIdsBeforeUpdate.includes(x));
    for (const mentionedUserId of newMentionedUserIds) {
      await this.notificationsService.create({
        userId: new mongoose.Types.ObjectId(mentionedUserId) as any,
        feedPostId: { _id: updatedComment.feedPostId } as unknown as FeedPost,
        feedCommentId: { _id: updatedComment._id } as unknown as FeedComment,
        senderId: user._id,
        notifyType: NotificationType.UserMentionedYouInAComment_MentionedYouInACommentReply_LikedYourReply_RepliedOnYourPost,
        notificationMsg: 'mentioned you in a comment',
      });
    }
    return pick(updatedComment, ['_id', 'feedPostId', 'message', 'userId', 'images']);
  }

  @Delete(':feedCommentId')
  async deleteFeedComment(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: FeedCommentsIdDto,
  ) {
    const user = getUserFromRequest(request);
    const feedComment = await this.feedCommentsService.findFeedComment(params.feedCommentId);
    if (!feedComment) {
      throw new HttpException('Not found.', HttpStatus.NOT_FOUND);
    }

    if (feedComment.userId.toString() !== user.id) {
      throw new HttpException('Permission denied.', HttpStatus.FORBIDDEN);
    }
    await this.feedCommentsService.deleteFeedComment(params.feedCommentId);
    return { success: true };
  }

  @Post('replies')
  @UseInterceptors(
    FilesInterceptor('images', 5, {
      fileFilter: (req, file, cb) => {
        if (
          !file.mimetype.includes('image/png')
          && !file.mimetype.includes('image/jpeg')
          && !file.mimetype.includes('image/gif')
        ) {
          return cb(new HttpException(
            'Invalid file type',
            HttpStatus.BAD_REQUEST,
          ), false);
        }
        return cb(null, true);
      },
      limits: {
        fileSize: MAXIMUM_IMAGE_UPLOAD_SIZE,
      },
    }),
  )
  async createFeedReply(
    @Req() request: Request,
    @Body() createFeedReplyDto: CreateFeedReplyDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    if (files.length > 4) {
      throw new HttpException(
        'Only allow a maximum of 4 images',
        HttpStatus.BAD_REQUEST,
      );
    }
    const user = getUserFromRequest(request);
    const comment = await this.feedCommentsService.findFeedComment(createFeedReplyDto.feedCommentId);
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
    const images = [];
    for (const file of files) {
      const storageLocation = this.storageLocationService.generateNewStorageLocationFor('feed', file.filename);
      if (this.config.get<string>('FILE_STORAGE') === 's3') {
        await this.s3StorageService.write(storageLocation, file);
      } else {
        this.localStorageService.write(storageLocation, file);
      }
      images.push({ image_path: storageLocation });
    }
    const reply = await this.feedCommentsService.createFeedReply(
      createFeedReplyDto.feedCommentId,
      user.id,
      createFeedReplyDto.message,
      images,
    );

    // Create notification for post creator, informing them that a reply was added to their post.
    // But don't send a notification to the creator if this is an rss feed post.
    const post = await this.feedPostsService.findById(reply.feedPostId.toString(), true);
    if (!post.rssfeedProviderId) {
      await this.notificationsService.create({
        userId: post.userId as any,
        feedPostId: { _id: reply.feedPostId } as unknown as FeedPost,
        feedCommentId: { _id: reply.feedCommentId } as unknown as FeedComment,
        feedReplyId: reply._id,
        senderId: user._id,
        notifyType: NotificationType.UserMentionedYouInAComment_MentionedYouInACommentReply_LikedYourReply_RepliedOnYourPost,
        notificationMsg: 'replied on your post',
      });
    }
    // Create notifications if any users were mentioned
    const mentionedUserIds = extractUserMentionIdsFromMessage(reply?.message);
    for (const mentionedUserId of mentionedUserIds) {
      await this.notificationsService.create({
        userId: new mongoose.Types.ObjectId(mentionedUserId) as any,
        feedPostId: { _id: reply.feedPostId } as unknown as FeedPost,
        feedCommentId: { _id: reply._id } as unknown as FeedComment,
        feedReplyId: reply._id,
        senderId: user._id,
        notifyType: NotificationType.UserMentionedYouInAComment_MentionedYouInACommentReply_LikedYourReply_RepliedOnYourPost,
        notificationMsg: 'mentioned you in a comment reply',
      });
    }

    return {
      _id: reply._id,
      feedCommentId: reply.feedCommentId,
      feedPostId: reply.feedPostId,
      message: reply.message,
      userId: reply.userId,
      images: reply.images,
    };
  }

  @Patch('replies/:feedReplyId')
  async updateFeedReply(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: FeedReplyIdDto,
    @Body() updateFeedReplyDto: UpdateFeedReplyDto,
  ) {
    const user = getUserFromRequest(request);
    const reply = await this.feedCommentsService.findFeedReply(params.feedReplyId);
    if (!reply) {
      throw new HttpException('Not found.', HttpStatus.NOT_FOUND);
    }

    if (reply.userId.toString() !== user.id) {
      throw new HttpException('Permission denied.', HttpStatus.FORBIDDEN);
    }

    const mentionedUserIdsBeforeUpdate = extractUserMentionIdsFromMessage(reply.message);
    const updatedReply = await this.feedCommentsService.updateFeedReply(params.feedReplyId, updateFeedReplyDto.message);
    const mentionedUserIdsAfterUpdate = extractUserMentionIdsFromMessage(updatedReply?.message);

    // Create notifications if any NEW users were mentioned after the edit
    const newMentionedUserIds = mentionedUserIdsAfterUpdate.filter((x) => !mentionedUserIdsBeforeUpdate.includes(x));
    for (const mentionedUserId of newMentionedUserIds) {
      await this.notificationsService.create({
        userId: new mongoose.Types.ObjectId(mentionedUserId) as any,
        feedPostId: { _id: updatedReply.feedPostId } as unknown as FeedPost,
        feedCommentId: { _id: updatedReply.feedCommentId } as unknown as FeedComment,
        feedReplyId: updatedReply._id,
        senderId: user._id,
        notifyType: NotificationType.UserMentionedYouInAComment_MentionedYouInACommentReply_LikedYourReply_RepliedOnYourPost,
        notificationMsg: 'mentioned you in a comment reply',
      });
    }
    return pick(updatedReply, ['_id', 'feedPostId', 'message', 'images', 'feedCommentId', 'userId']);
  }

  @Delete('replies/:feedReplyId')
  async deleteFeedReply(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: FeedReplyIdDto,
  ) {
    const user = getUserFromRequest(request);
    const feedReply = await this.feedCommentsService.findFeedReply(params.feedReplyId);
    if (!feedReply) {
      throw new HttpException('Not found.', HttpStatus.NOT_FOUND);
    }

    if (feedReply.userId.toString() !== user.id) {
      throw new HttpException('Permission denied.', HttpStatus.FORBIDDEN);
    }
    await this.feedCommentsService.deleteFeedReply(params.feedReplyId);
    return { success: true };
  }

  @TransformImageUrls(
    '$[*].images[*].image_path',
    '$[*].userId.profilePic',
    '$[*].replies[*].images[*].image_path',
    '$[*].replies[*].userId.profilePic',
  )
  @Get()
  async findFeedCommentsWithReplies(
    @Req() request: Request,
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) query: GetFeedCommentsDto,
  ) {
    const user = getUserFromRequest(request);
    const feedPost = await this.feedPostsService.findById(query.feedPostId, true);
    if (!feedPost) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }
    const block = await this.blocksService.blockExistsBetweenUsers(user.id, (feedPost.userId as unknown as User)._id.toString());
    if (block) {
      throw new HttpException('Request failed due to user block.', HttpStatus.BAD_REQUEST);
    }
    if ((feedPost.userId as unknown as User).profile_status !== ProfileVisibility.Public) {
      const areFriends = await this.friendsService.areFriends(user._id, (feedPost.userId as unknown as User)._id.toString());
      if (!areFriends) {
        throw new HttpException('You are not friends with the given user.', HttpStatus.UNAUTHORIZED);
      }
    }
    const allFeedCommentsWithReplies = await this.feedCommentsService.findFeedCommentsWithReplies(
      query.feedPostId,
      query.limit,
      query.sortBy,
      user.id,
      query.after ? new mongoose.Types.ObjectId(query.after) : undefined,
    );
    const commentReplies = [];
    for (const comment of allFeedCommentsWithReplies) {
      const comments = comment as any;
      const filterReply = comments.replies
        .map((reply) => {
          // eslint-disable-next-line no-param-reassign
          reply.likeCount = reply.likes.length;
          const {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            likes, __v, hideUsers, type, status, reportUsers, deleted, updatedAt, ...expectedReplyValues
          } = reply;
          return expectedReplyValues;
        });
      comments.replies = filterReply;
      comments.likeCount = comments.likes.length;
      delete comments.likes;
      delete comments.__v;
      commentReplies.push(comments);
    }
    return commentReplies.map(
      (comments) => pick(
        comments,
        ['_id', 'createdAt', 'message', 'images', 'feedPostId', 'userId', 'likedByUser', 'likeCount', 'commentCount', 'replies'],
      ),
    );
  }

  @TransformImageUrls(
    '$.images[*].image_path',
    '$.userId.profilePic',
    '$.replies[*].images[*].image_path',
    '$.replies[*].userId.profilePic',
  )
  @Get(':feedCommentId')
  async findOneFeedCommentWithReplies(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: FeedCommentsIdDto,
  ) {
    const user = getUserFromRequest(request);
    const feedCommentWithReplies = await this.feedCommentsService.findOneFeedCommentWithReplies(params.feedCommentId, true, user.id);
    if (!feedCommentWithReplies) {
      throw new HttpException('Comment not found', HttpStatus.NOT_FOUND);
    }
    const feedPost = await this.feedPostsService.findById(feedCommentWithReplies.feedPostId.toString(), true);
    if (!feedPost) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }
    const block = await this.blocksService.blockExistsBetweenUsers(user.id, (feedPost.userId as unknown as User)._id.toString());
    if (block) {
      throw new HttpException('Request failed due to user block.', HttpStatus.BAD_REQUEST);
    }
    if ((feedPost.userId as unknown as User).profile_status !== ProfileVisibility.Public) {
      const areFriends = await this.friendsService.areFriends(user._id, (feedPost.userId as unknown as User)._id.toString());
      if (!areFriends) {
        throw new HttpException('You are not friends with the given user.', HttpStatus.UNAUTHORIZED);
      }
    }
    const commentAndReplies = JSON.parse(JSON.stringify(feedCommentWithReplies));
    const filterReply = commentAndReplies.replies
      .map((reply) => {
        // eslint-disable-next-line no-param-reassign
        reply.likeCount = reply.likes.length;
        const {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          likes, __v, hideUsers, type, status, reportUsers, deleted, updatedAt, ...expectedReplyValues
        } = reply;
        return expectedReplyValues;
      });
    commentAndReplies.replies = filterReply;
    commentAndReplies.likeCount = commentAndReplies.likes.length;
    delete commentAndReplies.likes;
    delete commentAndReplies.__v;
    return pick(
      commentAndReplies,
      ['_id', 'createdAt', 'message', 'images', 'feedPostId', 'userId', 'likedByUser', 'likeCount', 'commentCount', 'replies'],
    );
  }
}
