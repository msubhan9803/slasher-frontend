/* eslint-disable max-lines */
import {
  Controller, HttpStatus, Post, Req, UseInterceptors, Body, UploadedFiles, HttpException, Param, Get, ValidationPipe, Patch, Query, Delete,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import mongoose from 'mongoose';
import { S3StorageService } from '../local-storage/providers/s3-storage.service';
import { LocalStorageService } from '../local-storage/providers/local-storage.service';
import { getUserFromRequest } from '../utils/request-utils';
import { FeedPostsService } from './providers/feed-posts.service';
import { CreateFeedPostsDto } from './dto/create-feed-post.dto';
import { UpdateFeedPostsDto } from './dto/update-feed-posts.dto';
import { FeedPost } from '../schemas/feedPost/feedPost.schema';
import { SingleFeedPostsDto } from './dto/find-single-feed-post.dto';
import { defaultQueryDtoValidationPipeOptions } from '../utils/validation-utils';
import { MainFeedPostQueryDto } from './dto/main-feed-post-query.dto';
import {
  MAXIMUM_IMAGE_UPLOAD_SIZE, MAX_ALLOWED_UPLOAD_FILES_FOR_POST, UPLOAD_PARAM_NAME_FOR_FILES,
} from '../constants';
import { TransformImageUrls } from '../app/decorators/transform-image-urls.decorator';
import { FeedPostDeletionState, PostType } from '../schemas/feedPost/feedPost.enums';
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
import { MoviesService } from '../movies/providers/movies.service';
import { generateFileUploadInterceptors } from '../app/interceptors/file-upload-interceptors';
import { AllFeedPostQueryDto } from './dto/all-feed-posts-query.dto';
import { MovieIdDto } from './dto/movie-id.dto';
import { MovieUserStatusService } from '../movie-user-status/providers/movie-user-status.service';
import { User } from '../schemas/user/user.schema';
import { getPostType } from '../utils/post-utils';
import { UsersService } from '../users/providers/users.service';

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
    private readonly moviesService: MoviesService,
    private readonly movieUserStatusService: MovieUserStatusService,
    private readonly usersService: UsersService,
  ) { }

  @TransformImageUrls('$.images[*].image_path')
  @Post()
  @UseInterceptors(
    ...generateFileUploadInterceptors(UPLOAD_PARAM_NAME_FOR_FILES, MAX_ALLOWED_UPLOAD_FILES_FOR_POST, {
      fileFilter: defaultFileInterceptorFileFilter,
      limits: { fileSize: MAXIMUM_IMAGE_UPLOAD_SIZE },
    }),
  )
  async createFeedPost(
    @Req() request: Request,
    @Body() createFeedPostsDto: CreateFeedPostsDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    if (createFeedPostsDto.postType === PostType.MovieReview && createFeedPostsDto.message === '') {
      throw new HttpException(
        'Review must have a some text',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (createFeedPostsDto.postType !== PostType.MovieReview && !files.length && createFeedPostsDto.message === '') {
      throw new HttpException(
        'Posts must have some text or at least one image.',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (files && files.length && files.length && files?.length !== createFeedPostsDto.imageDescriptions?.length) {
      throw new HttpException(
        'files length and imagesDescriptions length should be same',
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = getUserFromRequest(request);
    const images = [];
    for (const [index, file] of files.entries()) {
      const storageLocation = this.storageLocationService.generateNewStorageLocationFor('feed', file.filename);
      if (this.config.get<string>('FILE_STORAGE') === 's3') {
        await this.s3StorageService.write(storageLocation, file);
      } else {
        this.localStorageService.write(storageLocation, file);
      }
      const description = createFeedPostsDto?.imageDescriptions[index].description;
      const imageDescriptions = description === '' ? null : description;
      images.push({ image_path: storageLocation, description: imageDescriptions });
    }

    const feedPost = new FeedPost(createFeedPostsDto);
    feedPost.images = images;
    feedPost.userId = user._id;
    feedPost.postType = createFeedPostsDto.postType;

    if (createFeedPostsDto.moviePostFields) {
      if (createFeedPostsDto.postType !== PostType.MovieReview) {
        throw new HttpException('When submitting moviePostFields, post type must be MovieReview.', HttpStatus.BAD_REQUEST);
      }
      if (!createFeedPostsDto.movieId) {
        throw new HttpException('When submitting moviePostFields, movieId is required.', HttpStatus.BAD_REQUEST);
      }

      feedPost.spoilers = createFeedPostsDto.moviePostFields.spoilers;
      if (createFeedPostsDto.moviePostFields.rating) {
        await this.moviesService.createOrUpdateRating(
          feedPost.movieId.toString(),
          createFeedPostsDto.moviePostFields.rating,
          user.id,
        );
      }
      if (createFeedPostsDto.moviePostFields.goreFactorRating) {
        await this.moviesService.createOrUpdateGoreFactorRating(
          feedPost.movieId.toString(),
          createFeedPostsDto.moviePostFields.goreFactorRating,
          user.id,
        );
      }
      if (createFeedPostsDto.moviePostFields.worthWatching) {
        await this.moviesService.createOrUpdateWorthWatching(
          feedPost.movieId.toString(),
          createFeedPostsDto.moviePostFields.worthWatching,
          user.id,
        );
      }
    }

    const createFeedPost = await this.feedPostsService.create(feedPost);

    // Create notifications if any users were mentioned
    const mentionedUserIds = extractUserMentionIdsFromMessage(createFeedPost?.message);
    for (const mentionedUserId of mentionedUserIds) {
      await this.notificationsService.create({
        userId: new mongoose.Types.ObjectId(mentionedUserId) as any,
        feedPostId: createFeedPost.id,
        senderId: user._id,
        allUsers: [user._id as any], // senderId must be in allUsers for old API compatibility
        notifyType: NotificationType.UserMentionedYouInPost,
        notificationMsg: 'mentioned you in a post',
      });
    }

    return {
      _id: createFeedPost.id,
      message: createFeedPost.message,
      spoilers: createFeedPost.spoilers,
      userId: createFeedPost.userId,
      images: createFeedPost.images,
      postType: createFeedPostsDto.postType,
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
    const feedPost = await this.feedPostsService.findById(param.id, true, user.id);
    if (!feedPost) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }
    const postType = getPostType(feedPost);
    if (
      postType === PostType.User
      && user.id !== (feedPost.userId as any)._id.toString()
      && (feedPost.userId as any).profile_status !== ProfileVisibility.Public
    ) {
      const areFriends = await this.friendsService.areFriends(user.id, (feedPost.userId as any)._id.toString());
      if (!areFriends) {
        throw new HttpException('You must be friends with this user to perform this action.', HttpStatus.FORBIDDEN);
      }
    }

    if (postType !== PostType.News) {
      const block = await this.blocksService.blockExistsBetweenUsers((feedPost.userId as any)._id, user.id);
      if (block) {
        throw new HttpException('Request failed due to user block.', HttpStatus.FORBIDDEN);
      }
    }

    let reviewData;
    if (postType === PostType.MovieReview) {
      const movieUserStatusData = await this.movieUserStatusService.findMovieUserStatus(
        (feedPost.userId as any)._id.toString(),
        (feedPost.movieId as any)._id.toString(),
      );
      if (movieUserStatusData) {
        reviewData = {
          rating: movieUserStatusData.rating,
          goreFactorRating: movieUserStatusData.goreFactorRating,
          worthWatching: movieUserStatusData.worthWatching,
        };
      }
    }

    return {
      ...pick(
        feedPost,
        ['_id', 'createdAt', 'rssfeedProviderId', 'rssFeedId', 'images', 'userId', 'commentCount', 'likeCount', 'sharedList', 'likedByUser',
          'postType', 'spoilers', 'movieId', 'message'],
      ),
      reviewData,
    };
  }

  @TransformImageUrls('$.images[*].image_path')
  @Patch(':id')
  @UseInterceptors(
    ...generateFileUploadInterceptors(UPLOAD_PARAM_NAME_FOR_FILES, MAX_ALLOWED_UPLOAD_FILES_FOR_POST, {
      fileFilter: defaultFileInterceptorFileFilter,
      limits: { fileSize: MAXIMUM_IMAGE_UPLOAD_SIZE },
    }),
  )
  async update(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    param: SingleFeedPostsDto,
    @Body() updateFeedPostsDto: UpdateFeedPostsDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
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
        'Posts must have some text or at least one image. This post has no images, so a message is required.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const imagesToDelete = updateFeedPostsDto.imagesToDelete && updateFeedPostsDto.imagesToDelete.length;
    const newPostImages = files && files.length;
    const currentPostImages = feedPost.images && feedPost.images.length;
    const { message } = updateFeedPostsDto;

    if (feedPost.postType === PostType.MovieReview && updateFeedPostsDto.message === '') {
      throw new HttpException(
        'Review must have a some text',
        HttpStatus.BAD_REQUEST,
      );
    }

    // eslint-disable-next-line max-len
    const isPostWithoutImgAndMsg = (imagesToDelete && !newPostImages && message === '' && currentPostImages === imagesToDelete) || (!currentPostImages && !newPostImages && message === '');

    if (isPostWithoutImgAndMsg) {
      throw new HttpException(
        'Posts must have some text or at least one image.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // eslint-disable-next-line max-len
    const totalCommentImages = (imagesToDelete && currentPostImages - imagesToDelete + newPostImages) || (!imagesToDelete && currentPostImages + newPostImages);

    if (totalCommentImages > MAX_ALLOWED_UPLOAD_FILES_FOR_POST) {
      // eslint-disable-next-line max-len
      throw new HttpException(`Cannot include more than ${MAX_ALLOWED_UPLOAD_FILES_FOR_POST} images on a post.`, HttpStatus.BAD_REQUEST);
    }

    let imagesToKeep;
    if (updateFeedPostsDto.imagesToDelete) {
      imagesToKeep = feedPost.images.filter((image) => !updateFeedPostsDto.imagesToDelete.includes((image as any)._id.toString()));
    }

    let oldImagesDescription;
    let newImagesDescription;
    if (updateFeedPostsDto.imageDescriptions) {
      oldImagesDescription = updateFeedPostsDto.imageDescriptions.filter((item) => item._id);
      newImagesDescription = updateFeedPostsDto.imageDescriptions.filter((item) => !item._id);
    }

    if (files && files.length && files?.length !== newImagesDescription?.length) {
      throw new HttpException(
        'files length and imagesDescriptions length should be same',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (oldImagesDescription && oldImagesDescription.length) {
      feedPost.images.map((image) => {
        const matchingDesc = oldImagesDescription.find((desc) => desc._id === (image as any)._id.toString());
        if (matchingDesc) {
          // eslint-disable-next-line no-param-reassign
          image.description = matchingDesc.description;
        }
        return image;
      });
    }

    if (oldImagesDescription && oldImagesDescription.length && !newImagesDescription.length) {
      Object.assign(updateFeedPostsDto, { images: feedPost.images });
    }

    const images = [];
    for (const [index, file] of files.entries()) {
      const storageLocation = this.storageLocationService.generateNewStorageLocationFor('feed', file.filename);
      if (this.config.get<string>('FILE_STORAGE') === 's3') {
        await this.s3StorageService.write(storageLocation, file);
      } else {
        this.localStorageService.write(storageLocation, file);
      }
      const imageDescriptions = newImagesDescription[index]?.description === '' ? null : newImagesDescription[index]?.description;
      images.push({ image_path: storageLocation, description: imageDescriptions });
    }

    if (newPostImages || imagesToDelete) {
      const feedPostImages = images.concat(imagesToKeep);
      Object.assign(updateFeedPostsDto, { images: updateFeedPostsDto.imagesToDelete ? feedPostImages : images.concat(feedPost.images) });
    }

    if (updateFeedPostsDto.moviePostFields) {
      if (feedPost.postType !== PostType.MovieReview) {
        throw new HttpException('When submitting moviePostFields, post type must be MovieReview.', HttpStatus.BAD_REQUEST);
      }

      if (!feedPost.movieId) {
        throw new HttpException('When submitting moviePostFields, movieId is required.', HttpStatus.BAD_REQUEST);
      }
      // eslint-disable-next-line no-param-reassign
      (updateFeedPostsDto as unknown as FeedPost).spoilers = updateFeedPostsDto.moviePostFields.spoilers;
      if (updateFeedPostsDto.moviePostFields.rating) {
        await this.moviesService.createOrUpdateRating(
          (feedPost.movieId as any)._id.toString(),
          updateFeedPostsDto.moviePostFields.rating,
          user.id,
        );
      }
      if (updateFeedPostsDto.moviePostFields.goreFactorRating) {
        await this.moviesService.createOrUpdateGoreFactorRating(
          (feedPost.movieId as any)._id.toString(),
          updateFeedPostsDto.moviePostFields.goreFactorRating,
          user.id,
        );
      }
      if (typeof updateFeedPostsDto.moviePostFields.worthWatching === 'number') {
        await this.moviesService.createOrUpdateWorthWatching(
          (feedPost.movieId as any)._id.toString(),
          updateFeedPostsDto.moviePostFields.worthWatching,
          user.id,
        );
      }
    }
    const updatedFeedPost = await this.feedPostsService.update(param.id, updateFeedPostsDto);
    const mentionedUserIdsBeforeUpdate = extractUserMentionIdsFromMessage(feedPost.message);
    const mentionedUserIdsAfterUpdate = extractUserMentionIdsFromMessage(updateFeedPostsDto?.message);

    // Create notifications if any NEW users were mentioned after the edit
    const newMentionedUserIds = mentionedUserIdsAfterUpdate.filter((x) => !mentionedUserIdsBeforeUpdate.includes(x));
    for (const mentionedUserId of newMentionedUserIds) {
      await this.notificationsService.create({
        userId: new mongoose.Types.ObjectId(mentionedUserId) as any,
        feedPostId: updatedFeedPost.id,
        senderId: user._id,
        allUsers: [user._id as any], // senderId must be in allUsers for old API compatibility
        notifyType: NotificationType.UserMentionedYouInPost,
        notificationMsg: 'mentioned you in a post',
      });
    }

    return {
      _id: updatedFeedPost.id,
      message: updatedFeedPost.message,
      userId: updatedFeedPost.userId,
      images: updatedFeedPost.images,
      spoilers: updatedFeedPost.spoilers,
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
        ['_id', 'message', 'createdAt', 'lastUpdateAt',
          'rssfeedProviderId', 'images', 'userId', 'commentCount',
          'likeCount', 'likedByUser', 'movieId'],
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

  // TODO: Move this endpoint to `feed-likes` controller in future.
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

  @TransformImageUrls(
    '$[*].images[*].image_path',
    '$[*].userId.profilePic',
  )
  @Get(':movieId/reviews')
  async findMovieReviews(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: MovieIdDto,
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    query: AllFeedPostQueryDto,
  ) {
    const user = getUserFromRequest(request);
    const movieData = await this.moviesService.findById(params.movieId, true);
    if (!movieData) {
      throw new HttpException('Movie not found', HttpStatus.NOT_FOUND);
    }

    const posts = await this.feedPostsService.findPostsByMovieId(
      movieData._id.toString(),
      query.limit,
      true,
      query.before ? new mongoose.Types.ObjectId(query.before) : undefined,
      user._id.toString(),
    );
    const userIds = posts.map((id) => (id.userId as any)._id);

    const movieUserStatusData = await this.movieUserStatusService.findAllMovieUserStatus(userIds, movieData._id.toString());
    posts.map((post) => {
      movieUserStatusData.forEach((movie) => {
        // eslint-disable-next-line max-len
        if (movie.movieId.toString() === post.movieId.toString() && movie.userId.toString() === (post.userId as unknown as User)._id.toString()) {
          // eslint-disable-next-line no-param-reassign
          (post as any).reviewData = { rating: movie.rating, goreFactorRating: movie.goreFactorRating, worthWatching: movie.worthWatching };
        }
        return movie;
      });
      return post;
    });
    return posts.map(
      (post) => pick(
        post,
        [
          '_id', 'message', 'images',
          'userId', 'createdAt', 'likedByUser',
          'likeCount', 'commentCount', 'reviewData',
          'postType', 'spoilers', 'movieId',
        ],
      ),
    );
  }
}
