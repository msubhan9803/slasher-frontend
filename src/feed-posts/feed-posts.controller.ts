/* eslint-disable max-lines */
import {
  Controller, HttpStatus, Post, Req, UseInterceptors, Body, UploadedFiles, HttpException, Param, Get, ValidationPipe, Patch, Query, Delete,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import mongoose from 'mongoose';
import { S3StorageService } from '../local-storage/providers/s3-storage.service';
import { LocalStorageService } from '../local-storage/providers/local-storage.service';
import { getUserFromRequest } from '../utils/request-utils';
import { FeedPostsService } from './providers/feed-posts.service';
import { CreateOrUpdateFeedPostsDto } from './dto/create-or-update-feed-post.dto';
import { FeedPost } from '../schemas/feedPost/feedPost.schema';
import { SingleFeedPostsDto } from './dto/find-single-feed-post.dto';
import { defaultQueryDtoValidationPipeOptions } from '../utils/validation-utils';
import { MainFeedPostQueryDto } from './dto/main-feed-post-query.dto';
import { MAXIMUM_IMAGE_UPLOAD_SIZE, MAX_ALLOWED_UPLOAD_FILES_FOR_POST } from '../constants';
import { TransformImageUrls } from '../app/decorators/transform-image-urls.decorator';
import { FeedPostDeletionState } from '../schemas/feedPost/feedPost.enums';
import { NotificationType } from '../schemas/notification/notification.enums';
import { NotificationsService } from '../notifications/providers/notifications.service';
import { StorageLocationService } from '../global/providers/storage-location.service';
import { extractUserMentionIdsFromMessage } from '../utils/text-utils';
import { pick } from '../utils/object-utils';
import { ProfileVisibility } from '../schemas/user/user.enums';
import { BlocksService } from '../blocks/providers/blocks.service';
import { defaultFileInterceptorFileFilter } from '../utils/file-upload-utils';
import { LikesLimitOffSetDto } from './dto/likes-limit-offset-query.dto';
import { FriendsService } from '../friends/providers/friends.service';

@Controller({ path: 'feed-posts', version: ['1'] })
export class FeedPostsController {
  constructor(
    private readonly feedPostsService: FeedPostsService,
    private readonly config: ConfigService,
    private readonly localStorageService: LocalStorageService,
    private readonly s3StorageService: S3StorageService,
    private readonly storageLocationService: StorageLocationService,
    private readonly notificationsService: NotificationsService,
    private readonly blocksService: BlocksService,
    private readonly friendsService: FriendsService,
  ) { }

  @Post()
  @UseInterceptors(
    FilesInterceptor('files', MAX_ALLOWED_UPLOAD_FILES_FOR_POST + 1, {
      fileFilter: defaultFileInterceptorFileFilter,
      limits: {
        fileSize: MAXIMUM_IMAGE_UPLOAD_SIZE,
      },
    }),
  )
  async createFeedPost(
    @Req() request: Request,
    @Body() createOrUpdateFeedPostsDto: CreateOrUpdateFeedPostsDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    if (!files.length && createOrUpdateFeedPostsDto.message === '') {
      throw new HttpException(
        'Posts must have a message or at least one image. No message or image received.',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (files.length > 10) {
      throw new HttpException(
        'Only allow a maximum of 10 images',
        HttpStatus.BAD_REQUEST,
      );
    }
    const user = getUserFromRequest(request);
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

    const feedPost = new FeedPost(createOrUpdateFeedPostsDto);
    feedPost.images = images;
    feedPost.userId = user._id;
    const createFeedPost = await this.feedPostsService.create(feedPost);

    // Create notifications if any users were mentioned
    const mentionedUserIds = extractUserMentionIdsFromMessage(createFeedPost?.message);
    for (const mentionedUserId of mentionedUserIds) {
      await this.notificationsService.create({
        userId: new mongoose.Types.ObjectId(mentionedUserId) as any,
        feedPostId: createFeedPost.id,
        senderId: user._id,
        notifyType: NotificationType.UserMentionedYouInPost,
        notificationMsg: 'mentioned you in a post',
      });
    }

    return {
      _id: createFeedPost.id,
      message: createFeedPost.message,
      userId: createFeedPost.userId,
      images: createFeedPost.images,
    };
  }

  @TransformImageUrls('$.userId.profilePic', '$.rssfeedProviderId.logo', '$.images[*].image_path')
  @Get(':id')
  async singleFeedPostDetails(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    param: SingleFeedPostsDto,
  ) {
    const user = getUserFromRequest(request);
    const feedPost = await this.feedPostsService.findById(param.id, true);
    if (!feedPost) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }

    if (
      !feedPost.rssfeedProviderId
      && user.id !== (feedPost.userId as any)._id.toString()
      && (feedPost.userId as any).profile_status !== ProfileVisibility.Public
    ) {
      const areFriends = await this.friendsService.areFriends(user.id, (feedPost.userId as any)._id.toString());
      if (!areFriends) {
        throw new HttpException('You must be friends with this user to perform this action.', HttpStatus.FORBIDDEN);
      }
    }

    if (!feedPost.rssfeedProviderId) {
      const block = await this.blocksService.blockExistsBetweenUsers((feedPost.userId as any)._id, user.id);
      if (block) {
        throw new HttpException('Request failed due to user block.', HttpStatus.FORBIDDEN);
      }
    }
    return pick(
      feedPost,
      ['_id', 'createdAt', 'rssfeedProviderId', 'rssFeedId', 'images', 'userId', 'commentCount', 'likeCount', 'sharedList', 'likes',
        'message'],
    );
  }

  @Patch(':id')
  async update(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    param: SingleFeedPostsDto,
    @Body() createOrUpdateFeedPostsDto: CreateOrUpdateFeedPostsDto,
  ) {
    const feedPost = await this.feedPostsService.findById(param.id, true);
    if (!feedPost) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }

    const user = getUserFromRequest(request);
    if ((feedPost.userId as any)._id.toString() !== user._id.toString()) {
      throw new HttpException(
        'You can only edit a post that you created.',
        HttpStatus.FORBIDDEN,
      );
    }

    if (!feedPost.images.length && feedPost.message === '') {
      throw new HttpException(
        'Posts must have a message or at least one image. This post has no images, so a message is required.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const mentionedUserIdsBeforeUpdate = extractUserMentionIdsFromMessage(feedPost.message);
    const updatedFeedPost = await this.feedPostsService.update(param.id, createOrUpdateFeedPostsDto);
    const mentionedUserIdsAfterUpdate = extractUserMentionIdsFromMessage(createOrUpdateFeedPostsDto?.message);

    // Create notifications if any NEW users were mentioned after the edit
    const newMentionedUserIds = mentionedUserIdsAfterUpdate.filter((x) => !mentionedUserIdsBeforeUpdate.includes(x));
    for (const mentionedUserId of newMentionedUserIds) {
      await this.notificationsService.create({
        userId: new mongoose.Types.ObjectId(mentionedUserId) as any,
        feedPostId: updatedFeedPost.id,
        senderId: user._id,
        notifyType: NotificationType.UserMentionedYouInPost,
        notificationMsg: 'mentioned you in a post',
      });
    }

    return {
      _id: updatedFeedPost.id,
      message: updatedFeedPost.message,
    };
  }

  @TransformImageUrls(
    '$[*].images[*].image_path',
    '$[*].userId.profilePic',
    '$[*].rssfeedProviderId.logo',
  )
  @Get()
  async mainFeedPosts(
    @Req() request: Request,
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) mainFeedPostQueryDto: MainFeedPostQueryDto,
  ) {
    const user = getUserFromRequest(request);
    const feedPosts = await this.feedPostsService.findMainFeedPostsForUser(
      user.id,
      mainFeedPostQueryDto.limit,
      mainFeedPostQueryDto.before ? new mongoose.Types.ObjectId(mainFeedPostQueryDto.before) : undefined,
    );
    return feedPosts.map(
      (feedPost) => pick(
        feedPost,
        ['_id', 'message', 'createdAt', 'lastUpdateAt', 'rssfeedProviderId', 'images', 'userId', 'commentCount', 'likeCount', 'likes'],
      ),
    );
  }

  @Delete(':id')
  async delete(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    param: SingleFeedPostsDto,
  ) {
    const feedPost = await this.feedPostsService.findById(param.id, true);
    if (!feedPost) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }
    const user = getUserFromRequest(request);
    if ((feedPost.userId as any)._id.toString() !== user._id.toString()) {
      throw new HttpException(
        'You can only delete a post that you created.',
        HttpStatus.FORBIDDEN,
      );
    }
    await this.feedPostsService.update(feedPost.id, { is_deleted: FeedPostDeletionState.Deleted });
    return {
      success: true,
    };
  }

  @Post(':id/hide')
  async hidePost(
    @Req() request: Request, @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    param: SingleFeedPostsDto,
  ) {
    const user = getUserFromRequest(request);
    const feedPost = await this.feedPostsService.findById(param.id, true);
    if (!feedPost) {
      throw new HttpException(
        'Post not found.',
        HttpStatus.NOT_FOUND,
      );
    }

    const postCreatedByDifferentUser = feedPost.rssfeedProviderId || (feedPost.userId as any)._id.toString() !== user._id.toString();

    if (!postCreatedByDifferentUser) {
      throw new HttpException(
        'You cannot hide your own post.',
        HttpStatus.FORBIDDEN,
      );
    }
    await this.feedPostsService.hidePost(param.id, user.id);
    return { success: true };
  }

  @Get(':id/likes')
  async getLikeUsersForPost(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    param: SingleFeedPostsDto,
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) query: LikesLimitOffSetDto,
  ) {
    const user = getUserFromRequest(request);
    const feedPost = await this.feedPostsService.findById(param.id, true);
    if (!feedPost) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }

    const feedPostUser = feedPost.rssfeedProviderId ? null : (feedPost.userId as any)._id.toString();
    if (
      feedPostUser
      && user.id !== feedPostUser
      && (feedPost.userId as any).profile_status !== ProfileVisibility.Public
    ) {
      const areFriends = await this.friendsService.areFriends(user.id, feedPostUser);
      if (!areFriends) {
        throw new HttpException('You must be friends with this user to perform this action.', HttpStatus.FORBIDDEN);
      }
    }

    if (feedPostUser) {
      const block = await this.blocksService.blockExistsBetweenUsers(feedPostUser, user.id);
      if (block) {
        throw new HttpException('Request failed due to user block.', HttpStatus.FORBIDDEN);
      }
    }

    const feedLikeUsers = await this.feedPostsService.getLikeUsersForPost(
      param.id,
      query.limit,
      query.offset,
      user._id.toString(),
    );
    return feedLikeUsers;
  }
}
