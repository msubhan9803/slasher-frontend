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

@Controller('feed-likes')
export class FeedLikesController {
  constructor(
    private readonly feedLikesService: FeedLikesService,
    private readonly feedPostsService: FeedPostsService,
    private readonly feedCommentsService: FeedCommentsService,
  ) { }

  @Post('post/:feedPostId')
  async createFeedPostLike(@Req() request: Request, @Param() params: FeedPostsIdDto) {
    const user = getUserFromRequest(request);
    const feedPostDetails = await this.feedPostsService.findById(params.feedPostId, false);
    if (!feedPostDetails) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }
    await this.feedLikesService.createFeedPostLike(params.feedPostId, user._id);
  }

  @Delete('post/:feedPostId')
  async deleteFeedPostLike(@Req() request: Request, @Param() params: FeedPostsIdDto) {
    const user = getUserFromRequest(request);
    const feedPostDetails = await this.feedPostsService.findById(params.feedPostId, false);
    if (!feedPostDetails) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }
    await this.feedLikesService.deleteFeedPostLike(params.feedPostId, user._id);
  }

  @Post('comment/:feedCommentId')
  async createFeedCommentLike(@Req() request: Request, @Param() params: FeedCommentsIdDto) {
    const user = getUserFromRequest(request);
    const feedCommentDetails = await this.feedCommentsService.findFeedComment(params.feedCommentId.toString());
    if (!feedCommentDetails) {
      throw new HttpException('Comment not found', HttpStatus.NOT_FOUND);
    }
    await this.feedLikesService.createFeedCommentLike(params.feedCommentId, user._id);
  }

  @Delete('comment/:feedCommentId')
  async deleteFeedCommentLike(@Req() request: Request, @Param() params: FeedCommentsIdDto) {
    const user = getUserFromRequest(request);
    const feedCommentDetails = await this.feedCommentsService.findFeedComment(params.feedCommentId.toString());
    if (!feedCommentDetails) {
      throw new HttpException('Comment not found', HttpStatus.NOT_FOUND);
    }
    await this.feedLikesService.deleteFeedCommentLike(params.feedCommentId, user._id);
  }

  @Post('reply/:feedReplyId')
  async createFeedReplyLike(@Req() request: Request, @Param() params: FeedReplyIdDto) {
    const user = getUserFromRequest(request);
    const feedReplyDetails = await this.feedCommentsService.findFeedReply(params.feedReplyId.toString());
    if (!feedReplyDetails) {
      throw new HttpException('Reply not found', HttpStatus.NOT_FOUND);
    }
    await this.feedLikesService.createFeedReplyLike(params.feedReplyId, user._id);
  }

  @Delete('reply/:feedReplyId')
  async deleteFeedReplyLike(@Req() request: Request, @Param() params: FeedReplyIdDto) {
    const user = getUserFromRequest(request);
    const feedReplyDetails = await this.feedCommentsService.findFeedReply(params.feedReplyId.toString());
    if (!feedReplyDetails) {
      throw new HttpException('Reply not found', HttpStatus.NOT_FOUND);
    }
    await this.feedLikesService.deleteFeedReplyLike(params.feedReplyId, user._id);
  }
}
