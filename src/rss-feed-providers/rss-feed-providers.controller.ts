import {
  Controller, Delete, Get, HttpException, HttpStatus, Param, Patch, Post, Query, Req, ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import mongoose from 'mongoose';
import { Request } from 'express';
import { FeedPostsService } from '../feed-posts/providers/feed-posts.service';
import { TransformImageUrls } from '../app/decorators/transform-image-urls.decorator';
import { relativeToFullImagePath } from '../utils/image-utils';
import { defaultQueryDtoValidationPipeOptions } from '../utils/validation-utils';
import { ValidateAllRssFeedProvidersDto } from './dto/all-rss-feed-providers.dto';
import { FindFeedPostsForProviderQueryDto } from './dto/find-feed-posts-provider-query.dto';
import { ParamRssFeedProviderIdDto } from './dto/params-rss-feed-provider-id.dto';
import { RssFeedProvidersIdDto } from './dto/rss-feed-providers-id.dto';
import { RssFeedProvidersService } from './providers/rss-feed-providers.service';
import { RssFeedProviderFollowsService } from '../rss-feed-provider-follows/providers/rss-feed-provider-follows.service';
import { RssFeedProvidersIdAndUserDto } from './dto/rss-feed-providers-id-and-user-dto';
import { getUserFromRequest } from '../utils/request-utils';
import { RssFeedProviderFollowNotificationsEnabled } from '../schemas/rssFeedProviderFollow/rssFeedProviderFollow.enums';
import { pick } from '../utils/object-utils';

@Controller({ path: 'rss-feed-providers', version: ['1'] })
export class RssFeedProvidersController {
  constructor(
    private readonly rssFeedProvidersService: RssFeedProvidersService,
    private readonly rssFeedProviderFollowsService: RssFeedProviderFollowsService,
    private readonly config: ConfigService,
    private readonly feedPostsService: FeedPostsService,
  ) { }

  @Get(':id')
  async findOne(@Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: RssFeedProvidersIdDto) {
    const rssFeedProvider = await this.rssFeedProvidersService.findById(params.id, true);
    if (!rssFeedProvider) {
      throw new HttpException('RssFeedProvider not found', HttpStatus.NOT_FOUND);
    }
    rssFeedProvider.logo = relativeToFullImagePath(this.config, rssFeedProvider.logo);
    return pick(rssFeedProvider, [
      '_id', 'description', 'logo', 'title', 'feed_url',
    ]);
  }

  @Get()
  async findAll(
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    query: ValidateAllRssFeedProvidersDto,
  ) {
    const rssFeedProviders = await this.rssFeedProvidersService.findAll(
      query.limit,
      true,
      query.after ? new mongoose.Types.ObjectId(query.after) : undefined,
    );

    // Convert image relative paths to full paths
    for (const rssFeedProvider of rssFeedProviders) {
      rssFeedProvider.logo = relativeToFullImagePath(this.config, rssFeedProvider.logo);
    }

    return rssFeedProviders.map((feed) => pick(feed, [
      '_id', 'description', 'logo', 'title',
    ]));
  }

  @TransformImageUrls('$[*].images[*].image_path', '$[*].rssfeedProviderId.logo')
  @Get(':id/posts')
  async findFeedPostsForProvider(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    param: ParamRssFeedProviderIdDto,
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    query: FindFeedPostsForProviderQueryDto,
  ) {
    const user = getUserFromRequest(request);
    const rssFeedProvider = await this.rssFeedProvidersService.findById(param.id, true);
    if (!rssFeedProvider) {
      throw new HttpException('RssFeedProvider not found', HttpStatus.NOT_FOUND);
    }

    const feedPosts = await this.feedPostsService.findAllByRssFeedProvider(
      rssFeedProvider.id,
      query.limit,
      true,
      query.before ? new mongoose.Types.ObjectId(query.before) : undefined,
      user.id,
    );
    return feedPosts.map((feedPost) => pick(feedPost, [
      '_id', 'createdAt', 'commentCount', 'images', 'lastUpdateAt', 'likeCount', 'likedByUser', 'message',
      'movieId', 'rssFeedId', 'rssfeedProviderId', 'userId',
    ]));
  }

  @Get(':id/follows/:userId')
  async findFollow(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    params: RssFeedProvidersIdAndUserDto,
  ) {
    const user = getUserFromRequest(request);
    if (user.id !== params.userId) {
      throw new HttpException('Not authorized', HttpStatus.UNAUTHORIZED);
    }

    const rssFeedProvider = await this.rssFeedProvidersService.findById(params.id, true);
    if (!rssFeedProvider) {
      throw new HttpException('News partner not found', HttpStatus.NOT_FOUND);
    }

    const rssFeedProviderFollow = await this.rssFeedProviderFollowsService.findByUserAndRssFeedProvider(user.id, rssFeedProvider.id);
    if (!rssFeedProviderFollow) {
      throw new HttpException('Follow not found.', HttpStatus.NOT_FOUND);
    }
    return pick(rssFeedProviderFollow, ['notification']);
  }

  @Post(':id/follows/:userId')
  async createFollow(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: RssFeedProvidersIdAndUserDto,
  ) {
    const user = getUserFromRequest(request);
    if (user.id !== params.userId) { throw new HttpException('Not authorized', HttpStatus.UNAUTHORIZED); }

    const rssFeedProvider = await this.rssFeedProvidersService.findById(params.id, true);
    if (!rssFeedProvider) {
      throw new HttpException('News partner not found', HttpStatus.NOT_FOUND);
    }

    let rssFeedProviderFollow = await this.rssFeedProviderFollowsService.findByUserAndRssFeedProvider(user.id, rssFeedProvider.id);
    if (!rssFeedProviderFollow) {
      rssFeedProviderFollow = await this.rssFeedProviderFollowsService.create({ userId: user._id, rssfeedProviderId: rssFeedProvider._id });
    }
    return pick(rssFeedProviderFollow, ['notification']);
  }

  @Delete(':id/follows/:userId')
  async deleteFollow(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: RssFeedProvidersIdAndUserDto,
  ) {
    const user = getUserFromRequest(request);
    if (user.id !== params.userId) { throw new HttpException('Not authorized', HttpStatus.UNAUTHORIZED); }

    const rssFeedProvider = await this.rssFeedProvidersService.findById(params.id, true);
    if (!rssFeedProvider) {
      throw new HttpException('News partner not found', HttpStatus.NOT_FOUND);
    }

    const rssFeedProviderFollow = await this.rssFeedProviderFollowsService.findByUserAndRssFeedProvider(user.id, rssFeedProvider.id);
    if (rssFeedProviderFollow) {
      await this.rssFeedProviderFollowsService.deleteById(rssFeedProviderFollow._id.toString());
    }
    return { success: true };
  }

  @Patch(':id/follows/:userId/enable-notifications')
  async enableFollowNotifications(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: RssFeedProvidersIdAndUserDto,
  ) {
    const user = getUserFromRequest(request);
    if (user.id !== params.userId) { throw new HttpException('Not authorized', HttpStatus.UNAUTHORIZED); }

    const rssFeedProvider = await this.rssFeedProvidersService.findById(params.id, true);
    if (!rssFeedProvider) {
      throw new HttpException('News partner not found', HttpStatus.NOT_FOUND);
    }

    let rssFeedProviderFollow = await this.rssFeedProviderFollowsService.findByUserAndRssFeedProvider(user.id, rssFeedProvider.id);
    if (!rssFeedProviderFollow) {
      throw new HttpException('Not currently following this news partner', HttpStatus.BAD_REQUEST);
    }
    rssFeedProviderFollow = await this.rssFeedProviderFollowsService.update(
      rssFeedProviderFollow._id.toString(),
      { notification: RssFeedProviderFollowNotificationsEnabled.Enabled },
    );
    return pick(rssFeedProviderFollow, ['notification']);
  }

  @Patch(':id/follows/:userId/disable-notifications')
  async disableFollowNotifications(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: RssFeedProvidersIdAndUserDto,
  ) {
    const user = getUserFromRequest(request);
    if (user.id !== params.userId) { throw new HttpException('Not authorized', HttpStatus.UNAUTHORIZED); }

    const rssFeedProvider = await this.rssFeedProvidersService.findById(params.id, true);
    if (!rssFeedProvider) {
      throw new HttpException('News partner not found', HttpStatus.NOT_FOUND);
    }

    let rssFeedProviderFollow = await this.rssFeedProviderFollowsService.findByUserAndRssFeedProvider(user.id, rssFeedProvider.id);
    if (!rssFeedProviderFollow) {
      throw new HttpException('Not currently following this news partner', HttpStatus.BAD_REQUEST);
    }
    rssFeedProviderFollow = await this.rssFeedProviderFollowsService.update(
      rssFeedProviderFollow._id.toString(),
      { notification: RssFeedProviderFollowNotificationsEnabled.NotEnabled },
    );
    return pick(rssFeedProviderFollow, ['notification']);
  }
}
