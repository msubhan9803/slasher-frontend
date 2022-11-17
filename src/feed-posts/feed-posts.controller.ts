import {
  Controller, HttpStatus, Post, Req, UseInterceptors, Body, UploadedFiles, HttpException, Param, Get, ValidationPipe, Patch, Query,
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
import { relativeToFullImagePath } from '../utils/image-utils';
import { asyncDeleteMulterFiles } from '../utils/file-upload-validation-utils';
import { MainFeedPostQueryDto } from './dto/main-feed-post-query.dto';
import { MAXIMUM_IMAGE_UPLOAD_SIZE } from '../constants';
import { TransformImageUrls } from '../app/decorators/transform-image-urls.decorator';

@Controller('feed-posts')
export class FeedPostsController {
  constructor(
    private readonly feedPostsService: FeedPostsService,
    private readonly config: ConfigService,
    private readonly localStorageService: LocalStorageService,
    private readonly s3StorageService: S3StorageService,
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

    asyncDeleteMulterFiles(files);
    return {
      id: createFeedPost.id,
      message: createFeedPost.message,
      userId: createFeedPost.userId,
      images: createFeedPost.images,
    };
  }

  @Get(':id')
  async singleFeedPostDetails(
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    param: SingleFeedPostsDto,
  ) {
    const feedPost = await this.feedPostsService.findById(param.id, true);
    if (!feedPost) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }
    feedPost.images.map((relativeImagePath) => {
      // eslint-disable-next-line no-param-reassign
      relativeImagePath.image_path = relativeToFullImagePath(this.config, relativeImagePath.image_path);
      return relativeImagePath;
    });
    // TODO: Update feedPost so that "as any" type coercion isn't needed here
    (feedPost.userId as any).profilePic = relativeToFullImagePath(this.config, (feedPost.userId as any).profilePic);
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
}
