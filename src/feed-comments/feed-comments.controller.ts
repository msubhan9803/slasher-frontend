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
import { asyncDeleteMulterFiles } from '../utils/file-upload-validation-utils';
import { UpdateFeedCommentsDto } from './dto/update-feed-comments.dto';
import { CreateFeedReplyDto } from './dto/create-feed-reply.dto';
import { UpdateFeedReplyDto } from './dto/update-feed-reply.dto';
import { defaultQueryDtoValidationPipeOptions } from '../utils/validation-utils';
import { GetFeedCommentsDto } from './dto/get-feed-comments.dto';
import { FeedCommentsIdDto } from './dto/feed-comment-id-dto';
import { FeedReplyIdDto } from './dto/feed-reply-id.dto';
import { getUserFromRequest } from '../utils/request-utils';
import { TransformImageUrls } from '../app/decorators/transform-image-urls.decorator';

@Controller('feed-comments')
export class FeedCommentsController {
  constructor(
    private readonly feedCommentsService: FeedCommentsService,
    private readonly localStorageService: LocalStorageService,
    private readonly config: ConfigService,
    private readonly s3StorageService: S3StorageService,
  ) { }

  @Post()
  @UseInterceptors(
    FilesInterceptor('images', 5, {
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
  async createFeedComment(
    @Req() request: Request,
    @Body() createFeedCommentsDto: CreateFeedCommentsDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
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
    const createFeedComment = await this.feedCommentsService.createFeedComment(
      createFeedCommentsDto.feedPostId,
      user.id,
      createFeedCommentsDto.message,
      images,
    );

    asyncDeleteMulterFiles(files);
    return {
      feedPostId: createFeedComment.feedPostId,
      message: createFeedComment.message,
      userId: createFeedComment.userId,
      images: createFeedComment.images,
    };
  }

  @Patch(':feedCommentId')
  async updateFeedComment(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: FeedCommentsIdDto,
    @Body() updateFeedCommentsDto: UpdateFeedCommentsDto,
  ) {
    const user = getUserFromRequest(request);
    const feedComment = await this.feedCommentsService.findFeedComment(params.feedCommentId);
    if (!feedComment) {
      throw new HttpException('Not found.', HttpStatus.NOT_FOUND);
    }

    if (feedComment.userId.toString() !== user.id) {
      throw new HttpException('Permission denied.', HttpStatus.FORBIDDEN);
    }
    const feedCommentData = await this.feedCommentsService.updateFeedComment(params.feedCommentId, updateFeedCommentsDto.message);
    return feedCommentData;
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
    const createFeedComment = await this.feedCommentsService.createFeedReply(
      createFeedReplyDto.feedCommentId,
      user.id,
      createFeedReplyDto.message,
      images,
    );

    asyncDeleteMulterFiles(files);
    return {
      feedCommentId: createFeedComment.feedCommentId,
      feedPostId: createFeedComment.feedPostId,
      message: createFeedComment.message,
      userId: createFeedComment.userId,
      images: createFeedComment.images,
    };
  }

  @Patch('replies/:feedReplyId')
  async updateFeedReply(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: FeedReplyIdDto,
    @Body() updateFeedReplyDto: UpdateFeedReplyDto,
  ) {
    const user = getUserFromRequest(request);
    const feedReply = await this.feedCommentsService.findFeedReply(params.feedReplyId);
    if (!feedReply) {
      throw new HttpException('Not found.', HttpStatus.NOT_FOUND);
    }

    if (feedReply.userId.toString() !== user.id) {
      throw new HttpException('Permission denied.', HttpStatus.FORBIDDEN);
    }
    const feedReplyData = await this.feedCommentsService.updateFeedReply(params.feedReplyId, updateFeedReplyDto.message);
    return feedReplyData;
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
    const allFeedCommentsWithReplies = await this.feedCommentsService.findFeedCommentsWithReplies(
      query.feedPostId,
      query.limit,
      user.id,
      query.before ? new mongoose.Types.ObjectId(query.before) : undefined,
    );
    const commentReplies = [];
    for (const comment of allFeedCommentsWithReplies) {
      const comments = comment as any;
      const filterReply = comments.replies
        .map((reply) => {
          // eslint-disable-next-line no-param-reassign
          reply.likeCount = reply.likes.length;
          // eslint-disable-next-line no-param-reassign
          delete reply.likes;
          // eslint-disable-next-line no-param-reassign
          delete reply.__v;
          return reply;
        });
      comments.replies = filterReply;
      comments.likeCount = comments.likes.length;
      delete comments.likes;
      delete comments.__v;
      commentReplies.push(comments);
    }
    return commentReplies;
  }
}
