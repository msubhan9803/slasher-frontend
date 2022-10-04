import {
  Controller, HttpStatus, Post, Req, UseInterceptors, Body, UploadedFiles, HttpException, Param, Get, ValidationPipe, Patch,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { S3StorageService } from '../local-storage/providers/s3-storage.service';
import { LocalStorageService } from '../local-storage/providers/local-storage.service';
import { getUserFromRequest } from '../utils/request-utils';
import { FeedPostsService } from './providers/feed-posts.service';
import { CreateOrUpdateFeedPostDto } from './dto/create-or-update-feed-post.dto';
import { FeedPost } from '../schemas/feedPost/feedPost.schema';
import { SingleFeedPostDto } from './dto/find-single-feed-post.dto';
import { defaultQueryDtoValidationPipeOptions } from '../utils/validation-utils';

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
        fileSize: 20000000,
      },
    }),
  )
  async createFeedPost(
    @Req() request: Request,
    @Body() createOrUpdateFeedPostDto: CreateOrUpdateFeedPostDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    if (!files.length && createOrUpdateFeedPostDto.message === '') {
      throw new HttpException(
        'Posts must have a message or at least one image. No message or image received.',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!files.length) {
      throw new HttpException(
        'Please upload a file',
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

    const feedPost = new FeedPost(createOrUpdateFeedPostDto);
    feedPost.images = images;
    feedPost.userId = user._id;
    const createFeedPost = await this.feedPostsService.create(feedPost);
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
    param: SingleFeedPostDto,
    ) {
    const feedPost = await this.feedPostsService.findById(param.id, true);
    if (!feedPost) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }
    return feedPost;
  }

  @Patch(':id')
  async update(
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    param: SingleFeedPostDto,
    @Body() createOrUpdateFeedPostDto: CreateOrUpdateFeedPostDto,
    ) {
    const feedPost = await this.feedPostsService.findById(param.id, true);
    if (!feedPost) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }
    if (!feedPost.images.length && feedPost.message === '') {
      throw new HttpException(
        'Posts must have a message or at least one image. This post has no images, so a message is required.',
        HttpStatus.BAD_REQUEST,
      );
    }
    const feedPostData = await this.feedPostsService.update(param.id, createOrUpdateFeedPostDto);
    return {
      id: feedPostData.id,
      message: feedPostData.message,
    };
  }
}
