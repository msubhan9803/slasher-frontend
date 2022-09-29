import {
  Controller, HttpStatus, Post, Req, UseInterceptors, Body, UploadedFiles, HttpException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { S3StorageService } from '../local-storage/providers/s3-storage.service';
import { LocalStorageService } from '../local-storage/providers/local-storage.service';
import { getUserFromRequest } from '../utils/request-utils';
import { FeedPostsService } from './providers/feed-post.service';
import { CreateOrUpdateFeedPostDto } from './dto/create-or-update-feed-post.dto';
import { FeedPost } from '../schemas/feedPost/feedPost.schema';

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
          !file.mimetype.includes("image/png") &&
          !file.mimetype.includes("image/jpeg")
        ) {
          return cb(new HttpException(
            'Invalid file type',
            HttpStatus.BAD_REQUEST,
          ), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 20000000,
      },
    }),
  )
  async createFeedPost(
    @Req() request: Request,
    @Body() createOrUpdateFeedPostDto: CreateOrUpdateFeedPostDto,
    @UploadedFiles() files: Array<Express.Multer.File>
  ) {
    if (!files.length && createOrUpdateFeedPostDto.message === '') {
      throw new HttpException(
        "Posts must have a message or at least one image. No message or image received.",
        HttpStatus.BAD_REQUEST,
      )
    }
    if (!files.length) {
      throw new HttpException(
        "Please upload a file",
        HttpStatus.BAD_REQUEST,
      )
    }
    if (files.length > 4) {
      throw new HttpException(
        "Only allow a maximum of 4 images",
        HttpStatus.BAD_REQUEST,
      )
    }
    const user = getUserFromRequest(request);
    let images = []
    for (let file of files) {
      const storageLocation = `feedPost/feedPost_${file.filename}`;
      if (this.config.get<string>('FILE_STORAGE') === 's3') {
        const s3Host = `${this.config.get<string>('S3_HOST')}/feedPost/feedPost_${file.filename}`
        await this.s3StorageService.write(storageLocation, file);
        images.push({ image_path: s3Host })
      } 
      else {
        this.localStorageService.write(storageLocation, file);
        const image_path = this.localStorageService.getLocalFilePath(`/${storageLocation}`);
        images.push({ image_path: image_path })
      }
    }
    const feedPost = new FeedPost(createOrUpdateFeedPostDto);
    feedPost.images = images;
    feedPost.userId = user._id;
    const createFeedPost = await this.feedPostsService.create(feedPost);
    return {
      id: createFeedPost.id,
      message: createFeedPost.message,
      userId: createFeedPost.userId,
      images: createFeedPost.images
    };
  }
}
