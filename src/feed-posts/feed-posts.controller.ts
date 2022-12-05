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
import { asyncDeleteMulterFiles } from '../utils/file-upload-validation-utils';
import { MainFeedPostQueryDto } from './dto/main-feed-post-query.dto';
import { MAXIMUM_IMAGE_UPLOAD_SIZE } from '../constants';
import { TransformImageUrls } from '../app/decorators/transform-image-urls.decorator';
import { FeedPostDeletionState } from '../schemas/feedPost/feedPost.enums';
import { NotificationType } from '../schemas/notification/notification.enums';
import { NotificationsService } from '../notifications/providers/notifications.service';
import { NotificationsGateway } from '../notifications/providers/notifications.gateway';

@Controller('feed-posts')
export class FeedPostsController {
  constructor(
    private readonly feedPostsService: FeedPostsService,
    private readonly config: ConfigService,
    private readonly localStorageService: LocalStorageService,
    private readonly s3StorageService: S3StorageService,
    private readonly notificationsService: NotificationsService,
    private readonly notificationsGateway: NotificationsGateway,
  ) { }

  @Post()
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      fileFilter: (req, file, cb) => {
        if (
          !file.mimetype.includes('image/png')
          && !file.mimetype.includes('image/jpeg')
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
    if (files.length > 4) {
      throw new HttpException(
        'Only allow a maximum of 4 images',
        HttpStatus.BAD_REQUEST,
      );
    }
    const user = getUserFromRequest(request);
    const images = [];
    for (const file of files) {
      const storageLocation = `/feed/feed_${file.filename}`;
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

    if (createFeedPost) {
      // const mentionedUserIds = [];
      // Check the createFeedPost.message field for any occurrences of strings of this regular expression format:
      // ##LINK_ID##([^#]+@[^#]+)##LINK_END##
      // Here is an example message string:
      // Hello ##LINK_ID##5cf146426038e206a2fe681b@Damon##LINK_END##.
      // And hello ##LINK_ID##2cf146426038e206a2fe681c@SomeoneElse##LINK_END##.  This is my message.
      // For that string, we want the regex capture groups to be:
      // ["5cf146426038e206a2fe681b@Damon", "2cf146426038e206a2fe681c@SomeoneElse"]
      // If any captures are found, split on "@" and store the first part (before the @-sign) in the mentionedUserIds array.
      // where the key is the userId and the value is the userName.
      const collectMentionUser = createFeedPost.message.match(/[a-fA-F0-9]{24}@[a-zA-Z0-9_.-]+/g);
      console.log('collectMentionUser =', collectMentionUser);
      const mentionedUserIds = collectMentionUser.map((collectedUserData) => collectedUserData.split('@')[0]);
      console.log('mentionedUserIds =', mentionedUserIds);

      // Then:
      for (const mentionedUserId of mentionedUserIds) {
        const notificationObj: any = {
          userId: new mongoose.Types.ObjectId(mentionedUserId),
          feedPostId: createFeedPost._id,
          senderId: user._id,
          notifyType: NotificationType.PostMention,
          notificationMsg: 'had mentioned you in a post',
        };
        const notification = await this.notificationsService.create(notificationObj);
        // Note: You will need to inject NotificationsGateway into constructor of this class to use the line below
        this.notificationsGateway.emitMessageForNotification(notification);
      }
    }

    asyncDeleteMulterFiles(files);
    return {
      id: createFeedPost.id,
      message: createFeedPost.message,
      userId: createFeedPost.userId,
      images: createFeedPost.images,
    };
  }

  @TransformImageUrls('$.userId.profilePic', '$.rssfeedProviderId.logo', '$.images[*].image_path')
  @Get(':id')
  async singleFeedPostDetails(
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    param: SingleFeedPostsDto,
  ) {
    const feedPost = await this.feedPostsService.findById(param.id, true);
    if (!feedPost) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }
    return feedPost;
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

    const feedPostData = await this.feedPostsService.update(param.id, createOrUpdateFeedPostsDto);
    return {
      id: feedPostData.id,
      message: feedPostData.message,
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
    return feedPosts;
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
}
