/* eslint-disable max-lines */
import {
  Controller, HttpStatus, Post, Req, UseInterceptors, Body, UploadedFiles, HttpException, Param, Get, ValidationPipe, Patch, Query, Delete,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import mongoose from 'mongoose';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { S3StorageService } from '../local-storage/providers/s3-storage.service';
import { LocalStorageService } from '../local-storage/providers/local-storage.service';
import { getUserFromRequest } from '../utils/request-utils';
import { FeedPostsService } from './providers/feed-posts.service';
import { CreateFeedPostsDto } from './dto/create-feed-post.dto';
import { UpdateFeedPostsDto } from './dto/update-feed-posts.dto';
import { FeedPost, FeedPostDocument } from '../schemas/feedPost/feedPost.schema';
import { SingleFeedPostsDto } from './dto/find-single-feed-post.dto';
import { defaultQueryDtoValidationPipeOptions } from '../utils/validation-utils';
import { MainFeedPostQueryDto } from './dto/main-feed-post-query.dto';
import {
  MAXIMUM_IMAGE_UPLOAD_SIZE, MAX_ALLOWED_UPLOAD_FILES_FOR_POST, UPLOAD_PARAM_NAME_FOR_FILES,
} from '../constants';
import { TransformImageUrls } from '../app/decorators/transform-image-urls.decorator';
import {
  FeedPostDeletionState, FeedPostPrivacyType, PostType,
} from '../schemas/feedPost/feedPost.enums';
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
import { HashtagService } from '../hashtag/providers/hashtag.service';
import { AllFeedPostQueryDto } from './dto/all-feed-posts-query.dto';
import { HashtagDto } from './dto/hashtag.dto';
import { MovieIdDto } from './dto/movie-id.dto';
import { MovieUserStatusService } from '../movie-user-status/providers/movie-user-status.service';
import { User, UserDocument } from '../schemas/user/user.schema';
import { getPostType } from '../utils/post-utils';
import { UsersService } from '../users/providers/users.service';
import { UserFollowService } from '../user-follow/providers/userFollow.service';
import { HashtagFollowsService } from '../hashtag-follows/providers/hashtag-follows.service';
import { BooksService } from '../books/providers/books.service';
import { BookUserStatusService } from '../book-user-status/providers/book-user-status.service';
import { BookIdDto } from './dto/book-id.dto';

@Controller({ path: 'feed-posts', version: ['1'] })
export class FeedPostsController {
  constructor(
    @InjectQueue('hashtag-follow-post') private sendNotificationOfHashtagFollowPost: Queue,
    private readonly feedPostsService: FeedPostsService,
    private readonly config: ConfigService,
    private readonly localStorageService: LocalStorageService,
    private readonly s3StorageService: S3StorageService,
    private readonly storageLocationService: StorageLocationService,
    private readonly notificationsService: NotificationsService,
    private readonly blocksService: BlocksService,
    private readonly friendsService: FriendsService,
    private readonly hashtagService: HashtagService,
    private readonly moviesService: MoviesService,
    private readonly booksService: BooksService,
    private readonly movieUserStatusService: MovieUserStatusService,
    private readonly bookUserStatusService: BookUserStatusService,
    private readonly usersService: UsersService,
    private readonly userFollowService: UserFollowService,
    private readonly hashtagFollowsService: HashtagFollowsService,
  ) { }

  @TransformImageUrls('$.images[*].image_path')
  @Post()
  @UseInterceptors(
    ...generateFileUploadInterceptors(UPLOAD_PARAM_NAME_FOR_FILES, MAX_ALLOWED_UPLOAD_FILES_FOR_POST, MAXIMUM_IMAGE_UPLOAD_SIZE, {
      fileFilter: defaultFileInterceptorFileFilter,
    }),
  )
  async createFeedPost(
    @Req() request: Request,
    @Body() createFeedPostsDto: CreateFeedPostsDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    // ! TODO ~Sahil: Handle BookReview type here and test via postman first!
    // PostType.BookReview
    if (createFeedPostsDto.postType === (PostType.BookReview || PostType.MovieReview) && createFeedPostsDto.message === '') {
      throw new HttpException(
        'Review must have a some text',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (createFeedPostsDto.postType !== (PostType.BookReview || PostType.MovieReview)
      && !files.length && createFeedPostsDto.message === '') {
      throw new HttpException(
        'Posts must have some text or at least one image.',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (files && files.length && files?.length !== createFeedPostsDto.imageDescriptions?.length) {
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

    let hashtags; let message; let allUserIds = [];
    if (createFeedPostsDto.message && createFeedPostsDto.message.includes('#')) {
      const hashtagRegex = /(?<![?#])#(?![?#])\w+\b/g;
      const matchedHashtags = createFeedPostsDto.message.match(hashtagRegex);
      if (matchedHashtags && matchedHashtags.length) {
        const findHashtag = matchedHashtags.map((match) => match.slice(1).toLowerCase().replace(/([^\w\s]|_)+\d*$/, ''));
        if (findHashtag && findHashtag.length > 10) {
          throw new HttpException(
            'you can not add more than 10 hashtags on a post',
            HttpStatus.BAD_REQUEST,
          );
        }
        hashtags = [...new Set(findHashtag)];
      } else {
        hashtags = [];
      }

      const allHashTags = await this.hashtagService.createOrUpdateHashtags(hashtags);
      const hashtagIds = allHashTags.map((i) => i._id);
      allUserIds = await this.hashtagFollowsService.sendNotificationOfHashtagFollows(hashtagIds, user);
      const hashTagNames = allHashTags.map((hashTag) => `#${hashTag.name}`).join(' ');
      message = `added a new post with ${hashTagNames}`;
    }

    const feedPost = new FeedPost(createFeedPostsDto);
    feedPost.images = images;
    feedPost.userId = user._id;
    feedPost.hashtags = hashtags;
    feedPost.postType = createFeedPostsDto.postType;

    if (feedPost.businessListingRef) {
      feedPost.businessListingRef = createFeedPostsDto.businessListingRef;
    }

    if (user.profile_status === ProfileVisibility.Private) {
      feedPost.privacyType = FeedPostPrivacyType.Private;
    }

    if (createFeedPostsDto.bookPostFields) {
      if (createFeedPostsDto.postType !== PostType.BookReview) {
        throw new HttpException('When submitting bookPostFields, post type must be BookReview.', HttpStatus.BAD_REQUEST);
      }
      if (!createFeedPostsDto.bookId) {
        throw new HttpException('When submitting bookPostFields, bookId is required.', HttpStatus.BAD_REQUEST);
      }

      feedPost.spoilers = createFeedPostsDto.bookPostFields.spoilers;
      await this.booksService.updateBookPostFields(createFeedPostsDto.bookPostFields, feedPost);
    }

    if (createFeedPostsDto.moviePostFields) {
      if (createFeedPostsDto.postType !== PostType.MovieReview) {
        throw new HttpException('When submitting moviePostFields, post type must be MovieReview.', HttpStatus.BAD_REQUEST);
      }
      if (!createFeedPostsDto.movieId) {
        throw new HttpException('When submitting moviePostFields, movieId is required.', HttpStatus.BAD_REQUEST);
      }
      feedPost.spoilers = createFeedPostsDto.moviePostFields.spoilers;
      await this.moviesService.updateMoviePostFields(createFeedPostsDto.moviePostFields, feedPost);
    }
    const allFollowedUsers = await this.userFollowService.findAllUsersForFollowNotification(user.id);
    const userIds = allFollowedUsers.map((i) => i.userId.toString());

    const createFeedPost = await this.feedPostsService.create(feedPost);

    const mentionedUserIds = extractUserMentionIdsFromMessage(createFeedPost?.message);
    await this.sendFeedPostCreateNotification(mentionedUserIds, userIds, createFeedPost, user, allUserIds, message);

    return {
      _id: createFeedPost.id,
      message: createFeedPost.message,
      spoilers: createFeedPost.spoilers,
      userId: createFeedPost.userId,
      images: createFeedPost.images,
      postType: createFeedPostsDto.postType,
      hashtags: createFeedPost.hashtags,
    };
  }

  @TransformImageUrls('$.userId.profilePic', '$.rssfeedProviderId.logo', '$.images[*].image_path', '$.bookId.coverImage.image_path')
  @Get(':id')
  async singleFeedPostDetails(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    param: SingleFeedPostsDto,
  ) {
    const user = getUserFromRequest(request);
    const feedPost = await this.feedPostsService.findByIdWithPopulatedFields(param.id, true, user.id);
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

    if (postType === PostType.BookReview) {
      const bookUserStatusData = await this.bookUserStatusService.findBookUserStatus(
        (feedPost.userId as any)._id.toString(),
        (feedPost.bookId as any)._id.toString(),
      );
      if (bookUserStatusData) {
        reviewData = {
          rating: bookUserStatusData.rating,
          goreFactorRating: bookUserStatusData.goreFactorRating,
          worthReading: bookUserStatusData.worthReading,
        };
      }
    }

    const findActiveHashtags = await this.hashtagService.findActiveHashtags(feedPost.hashtags);
    feedPost.hashtags = findActiveHashtags.map((hashtag) => hashtag.name);

    return {
      ...pick(
        feedPost,
        ['_id', 'createdAt', 'rssfeedProviderId', 'rssFeedId', 'images', 'userId', 'commentCount', 'likeCount', 'sharedList', 'likedByUser',
          'postType', 'spoilers', 'movieId', 'bookId', 'message', 'hashtags'],
      ),
      reviewData,
    };
  }

  @TransformImageUrls('$.images[*].image_path')
  @Patch(':id')
  @UseInterceptors(
    ...generateFileUploadInterceptors(UPLOAD_PARAM_NAME_FOR_FILES, MAX_ALLOWED_UPLOAD_FILES_FOR_POST, MAXIMUM_IMAGE_UPLOAD_SIZE, {
      fileFilter: defaultFileInterceptorFileFilter,
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

    if (feedPost.postType === (PostType.MovieReview || PostType.BookReview) && updateFeedPostsDto.message === '') {
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

    let newHashtagNames;
    if (updateFeedPostsDto.message && updateFeedPostsDto.message.includes('#')) {
      const hashtagRegex = /(?<![?#])#(?![?#])\w+\b/g;
      const matchedHashtags = updateFeedPostsDto.message.match(hashtagRegex);
      if (matchedHashtags && matchedHashtags.length) {
        const findHashtag = matchedHashtags.map(
          (match) => match.slice(1).toLowerCase().replace(/([^\w\s]|_)+\d*$/, ''),
        );
        if (findHashtag && findHashtag.length > 10) {
          throw new HttpException(
            'you can not add more than 10 hashtags on a post',
            HttpStatus.BAD_REQUEST,
          );
        }
        newHashtagNames = [...new Set(findHashtag)];
      } else {
        newHashtagNames = [];
      }

      if (JSON.stringify(newHashtagNames) !== JSON.stringify(feedPost.hashtags)) {
        const addHashtagNameOrTotalPost = newHashtagNames.filter((item) => !feedPost.hashtags.includes(item));
        const totalPostDecrement = feedPost.hashtags.filter((item) => !newHashtagNames.includes(item));
        if (addHashtagNameOrTotalPost.length) {
          await this.hashtagService.createOrUpdateHashtags(addHashtagNameOrTotalPost);
        }
        if (totalPostDecrement.length) {
          await this.hashtagService.decrementTotalPost(totalPostDecrement);
        }
      }
    }
    if (updateFeedPostsDto.message && updateFeedPostsDto.message.indexOf('#') === -1) {
      await this.hashtagService.decrementTotalPost(feedPost.hashtags);
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
      await this.moviesService.updateMoviePostFields(updateFeedPostsDto.moviePostFields, feedPost);
    }

    if (updateFeedPostsDto.bookPostFields) {
      if (feedPost.postType !== PostType.BookReview) {
        throw new HttpException('When submitting bookPostFields, post type must be BookReview.', HttpStatus.BAD_REQUEST);
      }

      if (!feedPost.bookId) {
        throw new HttpException('When submitting bookPostFields, bookId is required.', HttpStatus.BAD_REQUEST);
      }
      // eslint-disable-next-line no-param-reassign
      (updateFeedPostsDto as unknown as FeedPost).spoilers = updateFeedPostsDto.bookPostFields.spoilers;
      await this.booksService.updateBookPostFields(updateFeedPostsDto.bookPostFields, feedPost);
    }

    const updatedFeedPost = await this.feedPostsService.update(
      param.id,
      Object.assign(updateFeedPostsDto, { hashtags: newHashtagNames || [] }),
    );

    const findActiveHashtags = await this.hashtagService.findActiveHashtags(updatedFeedPost.hashtags);
    updatedFeedPost.hashtags = findActiveHashtags.map((hashtag) => hashtag.name);

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
      hashtags: updatedFeedPost.hashtags,
    };
  }

  @TransformImageUrls(
    '$[*].images[*].image_path',
    '$[*].userId.profilePic',
    '$[*].bookId.coverImage.image_path',
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

    for (let i = 0; i < feedPosts.length; i += 1) {
      const findActiveHashtags = await this.hashtagService.findActiveHashtags(feedPosts[i].hashtags);
      feedPosts[i].hashtags = findActiveHashtags.map((hashtag) => hashtag.name);
    }

    return feedPosts.map(
      (feedPost) => pick(
        feedPost,
        ['_id', 'message', 'createdAt', 'lastUpdateAt',
          'rssfeedProviderId', 'images', 'userId', 'commentCount',
          'likeCount', 'likedByUser', 'movieId', 'bookId', 'hashtags', 'postType', 'businessListingRef'],
      ),
    );
  }

  @TransformImageUrls(
    '$[*].images[*].image_path',
    '$[*].userId.profilePic',
    '$[*].bookId.coverImage.image_path',
    '$[*].rssfeedProviderId.logo',
    '$[*].businessListingRef.businessLogo',
    '$[*].businessListingRef.bookRef.coverImage.image_path',
    '$[*].businessListingRef.movieRef.movieImage',
  )
  @Get('all/post')
  async allFeedPosts(
    @Req() request: Request,
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) mainFeedPostQueryDto: MainFeedPostQueryDto,
  ) {
    const user = getUserFromRequest(request);
    const feedPosts = await this.feedPostsService.findAllFeedPostsForUser(
      user.id,
      mainFeedPostQueryDto.limit,
      mainFeedPostQueryDto.before ? new mongoose.Types.ObjectId(mainFeedPostQueryDto.before) : undefined,
    );

    for (let i = 0; i < feedPosts.length; i += 1) {
      const findActiveHashtags = await this.hashtagService.findActiveHashtags(feedPosts[i].hashtags);
      feedPosts[i].hashtags = findActiveHashtags.map((hashtag) => hashtag.name);
    }

    return feedPosts.map(
      (feedPost) => pick(
        feedPost,
        ['_id', 'message', 'createdAt', 'lastUpdateAt',
          'rssfeedProviderId', 'images', 'userId', 'commentCount',
          'likeCount', 'likedByUser', 'movieId', 'bookId', 'hashtags', 'postType', 'businessListingRef'],
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
    if ((feedPost.userId as any).toString() !== user._id.toString()) {
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

    const postCreatedByDifferentUser = feedPost.rssfeedProviderId || (feedPost.userId as any).toString() !== user._id.toString();

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
    const feedPost = await this.feedPostsService.findByIdWithPopulatedFields(param.id, true);
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
      feedPost,
      query.limit,
      query.offset,
      user._id.toString(),
    );
    return feedLikeUsers;
  }

  @TransformImageUrls(
    '$.posts[*].images[*].image_path',
    '$.posts[*].userId.profilePic',
    '$[*].rssfeedProviderId.logo',
    '$[*].bookId.coverImage.image_path',
  )
  @Get('hashtag/:hashtag')
  async findPostByHashtag(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: HashtagDto,
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) allFeedPostQueryDto: AllFeedPostQueryDto,
  ) {
    const user = getUserFromRequest(request);

    const hashtag = await this.hashtagService.findByHashTagName(params.hashtag, true);
    if (!hashtag) {
      throw new HttpException('Hashtag not found', HttpStatus.NOT_FOUND);
    }

    const [count, feedPosts]: any = await this.feedPostsService.findAllFeedPostsForHashtag(
      params.hashtag,
      allFeedPostQueryDto.limit,
      allFeedPostQueryDto.before ? new mongoose.Types.ObjectId(allFeedPostQueryDto.before) : undefined,
      user.id,
    );

    for (let i = 0; i < feedPosts.length; i += 1) {
      const findActiveHashtags = await this.hashtagService.findActiveHashtags(feedPosts[i].hashtags);
      feedPosts[i].hashtags = findActiveHashtags.map((j) => j.name);
    }

    const posts = feedPosts.map(
      (feedPost) => pick(
        feedPost,
        ['_id', 'message', 'createdAt', 'lastUpdateAt',
          'rssfeedProviderId', 'images', 'userId', 'commentCount',
          'likeCount', 'likedByUser', 'hashtags', 'movieId', 'bookId'],
      ),
    );
    return { count, posts };
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

    for (let i = 0; i < posts.length; i += 1) {
      const findActiveHashtags = await this.hashtagService.findActiveHashtags(posts[i].hashtags);
      posts[i].hashtags = findActiveHashtags.map((hashtag) => hashtag.name);
    }

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
          'postType', 'spoilers', 'movieId', 'hashtags',
        ],
      ),
    );
  }

  @TransformImageUrls(
    '$[*].images[*].image_path',
    '$[*].userId.profilePic',
  )
  @Get(':bookId/bookreviews')
  async findBookReviews(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: BookIdDto,
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    query: AllFeedPostQueryDto,
  ) {
    const user = getUserFromRequest(request);
    const bookData = await this.booksService.findById(params.bookId, true);
    if (!bookData) {
      throw new HttpException('Book not found', HttpStatus.NOT_FOUND);
    }

    const posts = await this.feedPostsService.findPostsByBookId(
      bookData._id.toString(),
      query.limit,
      true,
      query.before ? new mongoose.Types.ObjectId(query.before) : undefined,
      user._id.toString(),
    );

    for (let i = 0; i < posts.length; i += 1) {
      const findActiveHashtags = await this.hashtagService.findActiveHashtags(posts[i].hashtags);
      posts[i].hashtags = findActiveHashtags.map((hashtag) => hashtag.name);
    }

    const userIds = posts.map((id) => (id.userId as any)._id);

    const bookUserStatusData = await this.bookUserStatusService.findAllBookUserStatus(userIds, bookData._id.toString());
    posts.map((post) => {
      bookUserStatusData.forEach((book) => {
        // eslint-disable-next-line max-len
        if (book.bookId.toString() === post.bookId.toString() && book.userId.toString() === (post.userId as unknown as User)._id.toString()) {
          // eslint-disable-next-line no-param-reassign
          (post as any).reviewData = { rating: book.rating, goreFactorRating: book.goreFactorRating, worthReading: book.worthReading };
        }
        return book;
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
          'postType', 'spoilers', 'bookId', 'hashtags',
        ],
      ),
    );
  }

  async sendFeedPostCreateNotification(
    mentionedUserIds: string[],
    allFollowedUsers: string[],
    createFeedPost: FeedPostDocument,
    postCreator: UserDocument,
    allUserIds: string[],
    hashtagNotification: string,
  ) {
    const allNewUser = allFollowedUsers.filter((userId) => !mentionedUserIds.includes(userId));
    const hashtagFollowUser = allUserIds.filter((userId) => !allNewUser.includes(userId));

    for (const mentionedUserId of mentionedUserIds) {
      await this.notificationsService.create({
        userId: new mongoose.Types.ObjectId(mentionedUserId) as any,
        feedPostId: createFeedPost.id,
        senderId: postCreator._id,
        allUsers: [postCreator._id as any], // senderId must be in allUsers for old API compatibility
        notifyType: NotificationType.UserMentionedYouInPost,
        notificationMsg: 'mentioned you in a post',
      });
    }

    const postTypeMessages = {
      [PostType.MovieReview]: 'has written a movie review',
      [PostType.BookReview]: 'has written a book review',
      default: 'created a new post',
    };

    for (const user of allNewUser) {
      await this.notificationsService.create({
        userId: new mongoose.Types.ObjectId(user) as any,
        feedPostId: createFeedPost.id,
        senderId: postCreator._id,
        allUsers: [postCreator._id as any], // senderId must be in allUsers for old API compatibility
        notifyType: NotificationType.NewPostFromFollowedUser,
        notificationMsg: postTypeMessages[createFeedPost.postType] || postTypeMessages.default,
      });
    }

    if (createFeedPost.hashtags && createFeedPost.hashtags.length && hashtagFollowUser && hashtagFollowUser.length) {
      await this.sendNotificationOfHashtagFollowPost.add('send-notification-of-hashtagfollow-post', {
        userId: hashtagFollowUser,
        feedPostId: createFeedPost.id,
        senderId: postCreator.id,
        notifyType: NotificationType.HashTagPostNotification,
        notificationMsg: hashtagNotification,
      });
    }
  }
}
