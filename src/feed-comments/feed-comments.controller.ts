import {
  Controller, HttpStatus, Post, UseInterceptors, Body, UploadedFiles, HttpException, Param, Patch,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { LocalStorageService } from '../local-storage/providers/local-storage.service';
import { FeedCommentsService } from './providers/feed-comments.service';
import { MAXIMUM_IMAGE_UPLOAD_SIZE } from '../constants';
import { CreateFeedCommentsDto } from './dto/create-feed-comments.dto';
import { asyncDeleteMulterFiles } from '../utils/file-upload-validation-utils';
import { UpdateFeedCommentsDto } from './dto/update-feed-comments.dto';

@Controller('feed-comments')
export class FeedCommentsController {
  constructor(
    private readonly feedCommentsService: FeedCommentsService,
    private readonly localStorageService: LocalStorageService,
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
    @Body() createFeedCommentsDto: CreateFeedCommentsDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    if (files.length > 4) {
      throw new HttpException(
        'Only allow a maximum of 4 images',
        HttpStatus.BAD_REQUEST,
      );
    }
    const images = [];
    for (const file of files) {
      const storageLocation = `/feed/feed_${file.filename}`;
      this.localStorageService.write(storageLocation, file);
      images.push({ image_path: storageLocation });
    }
    const createFeedComment = await this.feedCommentsService.createFeedComment(createFeedCommentsDto.feedPostId, createFeedCommentsDto.userId, createFeedCommentsDto.message, images);

    asyncDeleteMulterFiles(files);
    return {
      feedPostId: createFeedComment.feedPostId,
      message: createFeedComment.message,
      userId: createFeedComment.userId,
      images: createFeedComment.images,
    };
  }

  @Patch(':feedCommentId')
  async updateFeedComment(@Param('feedCommentId') feedCommentId: string, @Body() updateFeedCommentsDto: UpdateFeedCommentsDto) {
    const userData = await this.feedCommentsService.updateFeedComment(feedCommentId, updateFeedCommentsDto.message);
    return userData
  }

}
