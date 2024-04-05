/* eslint-disable max-lines */
import {
  Controller, HttpStatus, Post, UseInterceptors, Body, UploadedFiles, HttpException, Param, Patch, Delete, Query, Get, ValidationPipe, Req,
} from '@nestjs/common';
import mongoose from 'mongoose';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { S3StorageService } from '../local-storage/providers/s3-storage.service';
import { LocalStorageService } from '../local-storage/providers/local-storage.service';
import { FeedCommentsService } from './providers/feed-comments.service';
import {
  MAXIMUM_IMAGE_UPLOAD_SIZE, MAX_ALLOWED_UPLOAD_FILES_FOR_COMMENT, UPLOAD_PARAM_NAME_FOR_FILES, UPLOAD_PARAM_NAME_FOR_IMAGES,
} from '../constants';
import { CreateFeedCommentsDto } from './dto/create-feed-comments.dto';
import { UpdateFeedCommentsDto } from './dto/update-feed-comments.dto';
import { CreateFeedReplyDto } from './dto/create-feed-reply.dto';
import { UpdateFeedReplyDto } from './dto/update-feed-reply.dto';
import { defaultQueryDtoValidationPipeOptions } from '../utils/validation-utils';
import { GetFeedCommentsDto } from './dto/get-feed-comments.dto';
import { FeedCommentsIdDto } from './dto/feed-comment-id-dto';
import { FeedReplyIdDto } from './dto/feed-reply-id.dto';
import { getUserFromRequest } from '../utils/request-utils';
import { TransformImageUrls } from '../app/decorators/transform-image-urls.decorator';
import { StorageLocationService } from '../global/providers/storage-location.service';
import { NotificationType } from '../schemas/notification/notification.enums';
import { extractUserMentionIdsFromMessage } from '../utils/text-utils';
import { NotificationsService } from '../notifications/providers/notifications.service';
import { FeedPost, FeedPostDocument } from '../schemas/feedPost/feedPost.schema';
import { FeedComment } from '../schemas/feedComment/feedComment.schema';
import { FeedPostsService } from '../feed-posts/providers/feed-posts.service';
import { BlocksService } from '../blocks/providers/blocks.service';
import { pick } from '../utils/object-utils';
import { ProfileVisibility } from '../schemas/user/user.enums';
import { FriendsService } from '../friends/providers/friends.service';
import { User, UserDocument } from '../schemas/user/user.schema';
import { FeedReply } from '../schemas/feedReply/feedReply.schema';
import { defaultFileInterceptorFileFilter } from '../utils/file-upload-utils';
import { generateFileUploadInterceptors } from '../app/interceptors/file-upload-interceptors';
import { UsersService } from '../users/providers/users.service';
import { PostType } from '../schemas/feedPost/feedPost.enums';
import { PostAccessService } from '../feed-posts/providers/post-access.service';

@Controller({ path: 'feed-comments', version: ['1'] })
export class FeedCommentsController {
  constructor(
    private readonly feedPostsService: FeedPostsService,
    private readonly feedCommentsService: FeedCommentsService,
    private readonly localStorageService: LocalStorageService,
    private readonly notificationsService: NotificationsService,
    private readonly storageLocationService: StorageLocationService,
    private readonly config: ConfigService,
    private readonly s3StorageService: S3StorageService,
    private readonly blocksService: BlocksService,
    private readonly friendsService: FriendsService,
    private readonly usersService: UsersService,
    private readonly postAccessService: PostAccessService,
  ) { }

  @TransformImageUrls('$.images[*].image_path')
  @Post()
  @UseInterceptors(
    ...generateFileUploadInterceptors(UPLOAD_PARAM_NAME_FOR_IMAGES, MAX_ALLOWED_UPLOAD_FILES_FOR_COMMENT, MAXIMUM_IMAGE_UPLOAD_SIZE, {
      fileFilter: defaultFileInterceptorFileFilter,
    }),
  )
  async createFeedComment(
    @Req() request: Request,
    @Body() createFeedCommentsDto: CreateFeedCommentsDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    if (!files.length && createFeedCommentsDto.message === '') {
      throw new HttpException(
        'Comments must have some text or at least one image.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const post = await this.feedPostsService.findById(createFeedCommentsDto.feedPostId.toString(), true);
    if (!post) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }
    let isFriend = true;
    const user = getUserFromRequest(request);
    if (
      post.postType !== PostType.MovieReview && post.postType !== PostType.BookReview
      && !post.rssfeedProviderId
      && user.id !== (post.userId as unknown as User).toString()
    ) {
      isFriend = await this.friendsService.areFriends(user.id, (post.userId as unknown as User).toString()) || false;

      if (!isFriend) {
        await this.postAccessService.checkAccessPostService(user, post.hashtags);
      }
    }

    if (!post.rssfeedProviderId) {
      const block = await this.blocksService.blockExistsBetweenUsers(user.id, (post.userId as unknown as User).toString());
      if (block) {
        throw new HttpException('Request failed due to user block.', HttpStatus.FORBIDDEN);
      }
    }

    if (files && files.length && files?.length !== createFeedCommentsDto.imageDescriptions?.length) {
      throw new HttpException(
        'files length and imagesDescriptions length should be same',
        HttpStatus.BAD_REQUEST,
      );
    }

    const images = [];
    for (const [index, file] of files.entries()) {
      const storageLocation = this.storageLocationService.generateNewStorageLocationFor('feed', file.filename);
      if (this.config.get<string>('FILE_STORAGE') === 's3') {
        await this.s3StorageService.write(storageLocation, file);
      } else {
        this.localStorageService.write(storageLocation, file);
      }
      // eslint-disable-next-line max-len
      const imageDescriptions = createFeedCommentsDto.imageDescriptions[index].description === '' ? null : createFeedCommentsDto.imageDescriptions[index].description;
      images.push({ image_path: storageLocation, description: imageDescriptions });
    }

    const feedComment = new FeedComment(createFeedCommentsDto);
    feedComment.images = images;
    feedComment.userId = user._id;
    const comment = await this.feedCommentsService.createFeedComment(feedComment);
    await this.feedPostsService.updateLastUpdateAt(comment.feedPostId.toString());

    if (!post.rssfeedProviderId) {
      await this.sendFeedCommentCreationNotifications(user, comment, post);
    }
    return {
      _id: comment._id,
      feedPostId: comment.feedPostId,
      message: comment.message,
      userId: comment.userId,
      images: comment.images,
      isFriend,
    };
  }

  @TransformImageUrls('$.images[*].image_path')
  @Patch(':feedCommentId')
  @UseInterceptors(
    ...generateFileUploadInterceptors(UPLOAD_PARAM_NAME_FOR_FILES, MAX_ALLOWED_UPLOAD_FILES_FOR_COMMENT, MAXIMUM_IMAGE_UPLOAD_SIZE, {
      fileFilter: defaultFileInterceptorFileFilter,
    }),
  )
  async updateFeedComment(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: FeedCommentsIdDto,
    @Body() updateFeedCommentsDto: UpdateFeedCommentsDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    const user = getUserFromRequest(request);
    const comment = await this.feedCommentsService.findFeedComment(params.feedCommentId);
    if (!comment) {
      throw new HttpException('Not found.', HttpStatus.NOT_FOUND);
    }

    if (comment.userId.toString() !== user.id) {
      throw new HttpException('Permission denied.', HttpStatus.FORBIDDEN);
    }

    const imagesToDelete = updateFeedCommentsDto.imagesToDelete && updateFeedCommentsDto.imagesToDelete.length;
    const newCommentImages = files && files.length;
    const currentCommentImages = comment.images && comment.images.length;
    const { message } = updateFeedCommentsDto;

    // eslint-disable-next-line max-len
    const isCommentWithoutImgAndMsg = (imagesToDelete && !newCommentImages && message === '' && currentCommentImages === imagesToDelete) || (!currentCommentImages && !newCommentImages && message === '');
    if (isCommentWithoutImgAndMsg) {
      throw new HttpException(
        'Comments must have some text or at least one image.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // eslint-disable-next-line max-len
    const totalCommentImages = (imagesToDelete && currentCommentImages - imagesToDelete + newCommentImages) || (!imagesToDelete && currentCommentImages + newCommentImages);

    if (totalCommentImages > MAX_ALLOWED_UPLOAD_FILES_FOR_COMMENT) {
      // eslint-disable-next-line max-len
      throw new HttpException(`Cannot include more than ${MAX_ALLOWED_UPLOAD_FILES_FOR_COMMENT} images on a comment.`, HttpStatus.BAD_REQUEST);
    }

    let imagesToKeep;
    if (updateFeedCommentsDto.imagesToDelete) {
      imagesToKeep = comment.images.filter((image) => !updateFeedCommentsDto.imagesToDelete.includes((image as any)._id.toString()));
    }

    let oldImagesDescription;
    let newImagesDescription;
    if (updateFeedCommentsDto.imageDescriptions) {
      oldImagesDescription = updateFeedCommentsDto.imageDescriptions.filter((item) => item._id);
      newImagesDescription = updateFeedCommentsDto.imageDescriptions.filter((item) => !item._id);
    }

    if (files && files.length && files?.length !== newImagesDescription?.length) {
      throw new HttpException(
        'files length and imagesDescriptions length should be same',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (oldImagesDescription && oldImagesDescription.length) {
      comment.images.map((image) => {
        const matchingDesc = oldImagesDescription.find((desc) => desc._id === (image as any)._id.toString());
        if (matchingDesc) {
          // eslint-disable-next-line no-param-reassign
          image.description = matchingDesc.description;
        }
        return image;
      });
    }
    if (oldImagesDescription && oldImagesDescription.length && !newImagesDescription.length) {
      Object.assign(updateFeedCommentsDto, { images: comment.images });
    }
    const images = [];
    for (const [index, file] of files.entries()) {
      const storageLocation = this.storageLocationService.generateNewStorageLocationFor('feed', file.filename);
      if (this.config.get<string>('FILE_STORAGE') === 's3') {
        await this.s3StorageService.write(storageLocation, file);
      } else {
        this.localStorageService.write(storageLocation, file);
      }
      // eslint-disable-next-line max-len
      const imageDescriptions = newImagesDescription[index]?.description === '' ? null : newImagesDescription[index]?.description;
      images.push({ image_path: storageLocation, description: imageDescriptions });
    }
    if (newCommentImages || imagesToDelete) {
      const feedCommentImages = images.concat(imagesToKeep);
      Object.assign(
        updateFeedCommentsDto,
        {
          images: updateFeedCommentsDto.imagesToDelete ? feedCommentImages : images.concat(comment.images),
        },
      );
    }
    const updatedComment = await this.feedCommentsService.updateFeedComment(params.feedCommentId, updateFeedCommentsDto);

    const mentionedUserIdsBeforeUpdate = extractUserMentionIdsFromMessage(comment.message);
    const mentionedUserIdsAfterUpdate = extractUserMentionIdsFromMessage(updatedComment?.message);

    await this.sendFeedCommentUpdateNotifications(user, updatedComment, mentionedUserIdsBeforeUpdate, mentionedUserIdsAfterUpdate);
    return pick(updatedComment, ['_id', 'feedPostId', 'message', 'userId', 'images']);
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

    const feedPost = await this.feedPostsService.findById(feedComment.feedPostId.toString(), true);
    if (feedComment.userId.toString() !== user.id && (feedPost.userId as unknown as User).toString() !== user.id) {
      throw new HttpException('Permission denied.', HttpStatus.FORBIDDEN);
    }
    await this.feedCommentsService.deleteFeedComment(params.feedCommentId);
    return { success: true };
  }

  @TransformImageUrls('$.images[*].image_path')
  @Post('replies')
  @UseInterceptors(
    ...generateFileUploadInterceptors(UPLOAD_PARAM_NAME_FOR_IMAGES, MAX_ALLOWED_UPLOAD_FILES_FOR_COMMENT, MAXIMUM_IMAGE_UPLOAD_SIZE, {
      fileFilter: defaultFileInterceptorFileFilter,
    }),
  )
  async createFeedReply(
    @Req() request: Request,
    @Body() createFeedReplyDto: CreateFeedReplyDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    if (!files.length && createFeedReplyDto.message === '') {
      throw new HttpException(
        'Replies must have some text or at least one image.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = getUserFromRequest(request);
    const comment = await this.feedCommentsService.findFeedComment(createFeedReplyDto.feedCommentId.toString());
    if (!comment) {
      throw new HttpException('Comment not found', HttpStatus.NOT_FOUND);
    }
    const feedPost = await this.feedPostsService.findById(comment.feedPostId.toString(), true);
    if (!feedPost) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }
    const blockData = await this.blocksService.blockExistsBetweenUsers(user.id, comment.userId.toString());
    if (blockData) {
      throw new HttpException('Request failed due to user block (comment owner).', HttpStatus.FORBIDDEN);
    }

    if (!feedPost.rssfeedProviderId) {
      const block = await this.blocksService.blockExistsBetweenUsers(user.id, (feedPost.userId as unknown as User).toString());
      if (block) {
        throw new HttpException('Request failed due to user block (post owner).', HttpStatus.FORBIDDEN);
      }
    }
    let isFriend = true;
    if (
      feedPost.postType !== PostType.MovieReview && feedPost.postType !== PostType.BookReview
      && !feedPost.rssfeedProviderId
      && user.id !== (feedPost.userId as unknown as User).toString()
    ) {
      isFriend = await this.friendsService.areFriends(user.id, (feedPost.userId as unknown as User).toString()) || false;
      if (!isFriend) {
        await this.postAccessService.checkAccessPostService(user, feedPost.hashtags);
      }
    }

    if (files && files.length && files?.length !== createFeedReplyDto.imageDescriptions?.length) {
      throw new HttpException(
        'files length and imagesDescriptions length should be same',
        HttpStatus.BAD_REQUEST,
      );
    }

    const images = [];
    for (const [index, file] of files.entries()) {
      const storageLocation = this.storageLocationService.generateNewStorageLocationFor('feed', file.filename);
      if (this.config.get<string>('FILE_STORAGE') === 's3') {
        await this.s3StorageService.write(storageLocation, file);
      } else {
        this.localStorageService.write(storageLocation, file);
      }
      const { description } = createFeedReplyDto.imageDescriptions[index];
      const imageDescriptions = description === '' ? null : description;
      images.push({ image_path: storageLocation, description: imageDescriptions });
    }

    const feedReply = new FeedReply(createFeedReplyDto);
    feedReply.images = images;
    feedReply.userId = user._id;
    feedReply.feedPostId = comment.feedPostId;
    const reply = await this.feedCommentsService.createFeedReply(feedReply);
    await this.feedPostsService.updateLastUpdateAt(reply.feedPostId.toString());

    if (!feedPost.rssfeedProviderId) {
      await this.sendFeedReplyCreationNotifications(user, reply);
    }
    return {
      _id: reply._id,
      feedCommentId: reply.feedCommentId,
      feedPostId: reply.feedPostId,
      message: reply.message,
      userId: reply.userId,
      images: reply.images,
      isFriend,
    };
  }

  @TransformImageUrls('$.images[*].image_path')
  @Patch('replies/:feedReplyId')
  @UseInterceptors(
    ...generateFileUploadInterceptors(UPLOAD_PARAM_NAME_FOR_FILES, MAX_ALLOWED_UPLOAD_FILES_FOR_COMMENT, MAXIMUM_IMAGE_UPLOAD_SIZE, {
      fileFilter: defaultFileInterceptorFileFilter,
    }),
  )
  async updateFeedReply(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: FeedReplyIdDto,
    @Body() updateFeedReplyDto: UpdateFeedReplyDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    const user = getUserFromRequest(request);
    const reply = await this.feedCommentsService.findFeedReply(params.feedReplyId);
    if (!reply) {
      throw new HttpException('Not found.', HttpStatus.NOT_FOUND);
    }

    if (reply.userId.toString() !== user.id) {
      throw new HttpException('Permission denied.', HttpStatus.FORBIDDEN);
    }

    const imagesToDelete = updateFeedReplyDto.imagesToDelete && updateFeedReplyDto.imagesToDelete.length;
    const newReplyImages = files && files.length;
    const currentReplyImages = reply.images && reply.images.length;
    const { message } = updateFeedReplyDto;

    // eslint-disable-next-line max-len
    const isReplyWithoutImgAndMsg = (imagesToDelete && !newReplyImages && message === '' && currentReplyImages === imagesToDelete) || (!currentReplyImages && !newReplyImages && message === '');
    if (isReplyWithoutImgAndMsg) {
      throw new HttpException(
        'Replies must have some text or at least one image.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // eslint-disable-next-line max-len
    const totalReplyImages = (imagesToDelete && currentReplyImages - imagesToDelete + newReplyImages) || (!imagesToDelete && currentReplyImages + newReplyImages);

    if (totalReplyImages > MAX_ALLOWED_UPLOAD_FILES_FOR_COMMENT) {
      // eslint-disable-next-line max-len
      throw new HttpException(`Cannot include more than ${MAX_ALLOWED_UPLOAD_FILES_FOR_COMMENT} images on a reply.`, HttpStatus.BAD_REQUEST);
    }

    let imagesToKeep;
    if (updateFeedReplyDto.imagesToDelete) {
      imagesToKeep = reply.images.filter((image) => !updateFeedReplyDto.imagesToDelete.includes((image as any)._id.toString()));
    }

    let oldImagesDescription;
    let newImagesDescription;
    if (updateFeedReplyDto.imageDescriptions) {
      oldImagesDescription = updateFeedReplyDto.imageDescriptions.filter((item) => item._id);
      newImagesDescription = updateFeedReplyDto.imageDescriptions.filter((item) => !item._id);
    }

    if (files && files.length && files?.length !== newImagesDescription?.length) {
      throw new HttpException(
        'files length and imagesDescriptions length should be same',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (oldImagesDescription && oldImagesDescription.length) {
      reply.images.map((image) => {
        const matchingDesc = oldImagesDescription.find((desc) => desc._id === (image as any)._id.toString());
        if (matchingDesc) {
          // eslint-disable-next-line no-param-reassign
          image.description = matchingDesc.description;
        }
        return image;
      });
    }
    if (oldImagesDescription && oldImagesDescription.length && !newImagesDescription.length) {
      Object.assign(updateFeedReplyDto, { images: reply.images });
    }
    const images = [];
    for (const [index, file] of files.entries()) {
      const storageLocation = this.storageLocationService.generateNewStorageLocationFor('feed', file.filename);
      if (this.config.get<string>('FILE_STORAGE') === 's3') {
        await this.s3StorageService.write(storageLocation, file);
      } else {
        this.localStorageService.write(storageLocation, file);
      }
      const imageDescriptions = newImagesDescription[index].description === '' ? null : newImagesDescription[index].description;
      images.push({ image_path: storageLocation, description: imageDescriptions });
    }

    if (newReplyImages || imagesToDelete) {
      const feedReplyImages = images.concat(imagesToKeep);
      Object.assign(updateFeedReplyDto, { images: updateFeedReplyDto.imagesToDelete ? feedReplyImages : images.concat(reply.images) });
    }

    const updatedReply = await this.feedCommentsService.updateFeedReply(params.feedReplyId, updateFeedReplyDto);

    const mentionedUserIdsBeforeUpdate = extractUserMentionIdsFromMessage(reply.message);
    const mentionedUserIdsAfterUpdate = extractUserMentionIdsFromMessage(updatedReply?.message);

    await this.sendFeedReplyUpdateNotifications(user, updatedReply, mentionedUserIdsBeforeUpdate, mentionedUserIdsAfterUpdate);
    return pick(updatedReply, ['_id', 'feedPostId', 'message', 'images', 'feedCommentId', 'userId']);
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

    const feedPost = await this.feedPostsService.findById(feedReply.feedPostId.toString(), true);
    if (feedReply.userId.toString() !== user.id && (feedPost.userId as unknown as User).toString() !== user.id) {
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
    const feedPost = await this.feedPostsService.findByIdWithPopulatedFields(query.feedPostId, true);
    if (!feedPost) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }

    if (
      !feedPost.rssfeedProviderId
      && user.id !== (feedPost.userId as unknown as User)._id.toString()
      && (feedPost.userId as unknown as User).profile_status !== ProfileVisibility.Public
    ) {
      const areFriends = await this.friendsService.areFriends(user.id, (feedPost.userId as unknown as User)._id.toString());
      if (!areFriends) {
        throw new HttpException('You must be friends with this user to perform this action.', HttpStatus.FORBIDDEN);
      }
    }

    if (!feedPost.rssfeedProviderId) {
      const block = await this.blocksService.blockExistsBetweenUsers(user.id, (feedPost.userId as unknown as User)._id.toString());
      if (block) {
        throw new HttpException('Request failed due to user block.', HttpStatus.FORBIDDEN);
      }
    }

    const excludedUserIds = await this.blocksService.getUserIdsForBlocksToOrFromUser(user.id);
    const allFeedCommentsWithReplies = await this.feedCommentsService.findFeedCommentsWithReplies(
      query.feedPostId,
      query.limit,
      query.sortBy,
      excludedUserIds,
      user.id,
      query.after ? new mongoose.Types.ObjectId(query.after) : undefined,
    );
    const commentReplies = [];
    for (const comment of allFeedCommentsWithReplies) {
      const comments = comment as any;
      const filterReply = comments.replies
        .map((reply) => {
          // eslint-disable-next-line no-param-reassign
          reply.likeCount = reply.likes.length;
          const {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            likes, __v, hideUsers, type, status, reportUsers, deleted, updatedAt, ...expectedReplyValues
          } = reply;
          return expectedReplyValues;
        });
      comments.replies = filterReply;
      comments.likeCount = comments.likes.length;
      delete comments.likes;
      delete comments.__v;
      commentReplies.push(comments);
    }
    return commentReplies.map(
      (comments) => pick(
        comments,
        ['_id', 'createdAt', 'message', 'images', 'feedPostId', 'userId', 'likedByUser', 'likeCount', 'commentCount', 'replies'],
      ),
    );
  }

  @TransformImageUrls(
    '$.images[*].image_path',
    '$.userId.profilePic',
    '$.replies[*].images[*].image_path',
    '$.replies[*].userId.profilePic',
  )
  @Get(':feedCommentId')
  async findOneFeedCommentWithReplies(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: FeedCommentsIdDto,
  ) {
    const user = getUserFromRequest(request);
    const excludedUserIds = await this.blocksService.getUserIdsForBlocksToOrFromUser(user.id);
    const feedCommentWithReplies = await this.feedCommentsService.findOneFeedCommentWithReplies(
      params.feedCommentId,
      true,
      excludedUserIds,
      user.id,
    );
    if (!feedCommentWithReplies) {
      throw new HttpException('Comment not found', HttpStatus.NOT_FOUND);
    }
    const feedPost = await this.feedPostsService.findByIdWithPopulatedFields(feedCommentWithReplies.feedPostId.toString(), true);
    if (!feedPost) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }

    if (
      !feedPost.rssfeedProviderId
      && user.id !== (feedPost.userId as unknown as User)._id.toString()
      && (feedPost.userId as unknown as User).profile_status !== ProfileVisibility.Public
    ) {
      const areFriends = await this.friendsService.areFriends(user.id, (feedPost.userId as unknown as User)._id.toString());
      if (!areFriends) {
        throw new HttpException('You must be friends with this user to perform this action.', HttpStatus.FORBIDDEN);
      }
    }

    if (!feedPost.rssfeedProviderId) {
      const block = await this.blocksService.blockExistsBetweenUsers(user.id, (feedPost.userId as unknown as User)._id.toString());
      if (block) {
        throw new HttpException('Request failed due to user block.', HttpStatus.FORBIDDEN);
      }
    }
    const commentAndReplies = JSON.parse(JSON.stringify(feedCommentWithReplies));
    const filterReply = commentAndReplies.replies
      .map((reply) => {
        // eslint-disable-next-line no-param-reassign
        reply.likeCount = reply.likes.length;
        const {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          likes, __v, hideUsers, type, status, reportUsers, deleted, updatedAt, ...expectedReplyValues
        } = reply;
        return expectedReplyValues;
      });
    commentAndReplies.replies = filterReply;
    commentAndReplies.likeCount = commentAndReplies.likes.length;
    delete commentAndReplies.likes;
    delete commentAndReplies.__v;
    return pick(
      commentAndReplies,
      ['_id', 'createdAt', 'message', 'images', 'feedPostId', 'userId', 'likedByUser', 'likeCount', 'commentCount', 'replies'],
    );
  }

  async sendFeedCommentCreationNotifications(commentCreatorUser: UserDocument, comment: FeedComment, post: FeedPostDocument) {
    // keep track of notifications that are sent, so we don't send more than one to the same user
    const userIdsToSkip: string[] = [commentCreatorUser.id];

    // First send notification for post creator, informing them that a comment was added to their post
    const postCreatorUserId: string = (post.userId as any)._id.toString();
    const skipPostCreatorNotification = (
      // Don't send a "commented on your post" notification to the post creator if any of
      // the following conditions apply:
      post.rssfeedProviderId // rss feed posts are not created by a real user
      || userIdsToSkip.includes(postCreatorUserId)
    );
    const postTypeMessages = {
      [PostType.MovieReview]: 'commented on your movie review',
      [PostType.BookReview]: 'commented on your book review',
      default: 'commented on your post',
    };

    if (!skipPostCreatorNotification) {
      userIdsToSkip.push(postCreatorUserId);
      await this.notificationsService.create({
        userId: (post.userId as unknown as User)._id,
        feedPostId: comment.feedPostId as any,
        feedCommentId: comment._id as any,
        senderId: commentCreatorUser._id,
        allUsers: [commentCreatorUser._id as any], // senderId must be in allUsers for old API compatibility
        notifyType: NotificationType.UserCommentedOnYourPost,
        notificationMsg: postTypeMessages[post.postType] || postTypeMessages.default,
      });
    }

    // Then create notifications if any users were mentioned
    const mentionedUserIds = extractUserMentionIdsFromMessage(comment?.message);
    for (const mentionedUserId of mentionedUserIds) {
      if (!userIdsToSkip.includes(mentionedUserId)) {
        await this.notificationsService.create({
          userId: mentionedUserId as any,
          feedPostId: { _id: comment.feedPostId.toString() } as unknown as FeedPost,
          feedCommentId: { _id: comment._id.toString() } as unknown as FeedComment,
          senderId: commentCreatorUser._id,
          allUsers: [commentCreatorUser._id as any], // senderId must be in allUsers for old API compatibility
          notifyType: NotificationType.UserMentionedYouInAComment,
          notificationMsg: 'mentioned you in a comment',
        });
      }
    }
  }

  async sendFeedCommentUpdateNotifications(
    commentUpdateUser: UserDocument,
    comment: FeedComment,
    mentionedUserIdsBeforeUpdate: string[],
    mentionedUserIdsAfterUpdate: string[],
  ) {
    // Create notifications if any NEW users were mentioned after the edit.
    // Always ignore the comment update user's user id.
    const newMentionedUserIds = mentionedUserIdsAfterUpdate.filter(
      (x) => !mentionedUserIdsBeforeUpdate.includes(x) && x !== commentUpdateUser.id,
    );
    for (const mentionedUserId of newMentionedUserIds) {
      await this.notificationsService.create({
        userId: new mongoose.Types.ObjectId(mentionedUserId) as any,
        feedPostId: { _id: comment.feedPostId } as unknown as FeedPost,
        feedCommentId: { _id: comment._id } as unknown as FeedComment,
        senderId: commentUpdateUser._id,
        allUsers: [commentUpdateUser._id as any], // senderId must be in allUsers for old API compatibility
        notifyType: NotificationType.UserMentionedYouInAComment,
        notificationMsg: 'mentioned you in a comment',
      });
    }
  }

  async sendFeedReplyCreationNotifications(replyCreatorUser: UserDocument, reply: FeedReply) {
    // keep track of notifications that are sent, so we don't send more than one to the same user
    const userIdsToSkip: string[] = [replyCreatorUser.id];

    // Create notification for post creator, informing them that a reply was added to their post
    const post = await this.feedPostsService.findById(reply.feedPostId.toString(), true);
    const postCreatorUserId: string = (post.userId as any).toString();
    const skipPostCreatorNotification = (
      // Don't send a "replied on your post" notification to the post creator if any of
      // the following conditions apply:
      post.rssfeedProviderId // rss feed posts are not created by a real user
      || userIdsToSkip.includes(postCreatorUserId)
    );
    const postTypeMessages = {
      [PostType.MovieReview]: 'replied to a comment on your movie review',
      [PostType.BookReview]: 'replied to a comment on your book review',
      default: 'replied to a comment on your post',
    };

    if (!skipPostCreatorNotification) {
      userIdsToSkip.push(postCreatorUserId);
      await this.notificationsService.create({
        userId: post.userId,
        feedPostId: reply.feedPostId as any,
        feedCommentId: reply.feedCommentId as any,
        feedReplyId: reply._id,
        senderId: replyCreatorUser._id,
        allUsers: [replyCreatorUser._id as any], // senderId must be in allUsers for old API compatibility
        notifyType: NotificationType.UserMentionedYouInACommentReply,
        notificationMsg: postTypeMessages[post.postType] || postTypeMessages.default,
      });
    }

    // Create notification for comment creator, informing them that a reply was added to their comment
    const comment = await this.feedCommentsService.findFeedComment(reply.feedCommentId.toString());
    const commentUserId = comment.userId.toString();
    const skipCommentCreatorNotification = (
      // Don't send a "replied to your comment" notification to the post creator if any of
      // the following conditions apply:
      userIdsToSkip.includes(commentUserId)
    );
    if (!skipCommentCreatorNotification) {
      userIdsToSkip.push(commentUserId);
      await this.notificationsService.create({
        userId: comment.userId.toString() as any,
        feedPostId: { _id: reply.feedPostId.toString() } as unknown as FeedPost,
        feedCommentId: { _id: reply.feedCommentId.toString() } as unknown as FeedComment,
        feedReplyId: reply._id.toString() as any,
        senderId: replyCreatorUser.id,
        allUsers: [replyCreatorUser._id as any], // senderId must be in allUsers for old API compatibility
        notifyType: NotificationType.UserMentionedYouInACommentReply,
        notificationMsg: 'replied to your comment',
      });
    }

    // Create notifications if any users were mentioned
    const mentionedUserIds = extractUserMentionIdsFromMessage(reply?.message);
    for (const mentionedUserId of mentionedUserIds) {
      if (!userIdsToSkip.includes(mentionedUserId)) {
        await this.notificationsService.create({
          userId: mentionedUserId as any,
          feedPostId: { _id: reply.feedPostId.toString() } as unknown as FeedPost,
          feedCommentId: { _id: reply.feedCommentId.toString() } as unknown as FeedComment,
          feedReplyId: reply._id.toString() as any,
          senderId: replyCreatorUser.id,
          allUsers: [replyCreatorUser._id as any], // senderId must be in allUsers for old API compatibility
          notifyType: NotificationType.UserMentionedYouInACommentReply,
          notificationMsg: 'mentioned you in a reply',
        });
      }
    }
  }

  async sendFeedReplyUpdateNotifications(
    replyUpdateUser: User,
    feedReply: FeedReply,
    mentionedUserIdsBeforeUpdate: string[],
    mentionedUserIdsAfterUpdate: string[],
  ) {
    // Create notifications if any NEW users were mentioned after the edit.
    // Always ignore the reply update user's user id.
    const newMentionedUserIds = mentionedUserIdsAfterUpdate.filter(
      (x) => !mentionedUserIdsBeforeUpdate.includes(x) && x !== replyUpdateUser._id.toString(),
    );
    for (const mentionedUserId of newMentionedUserIds) {
      await this.notificationsService.create({
        userId: new mongoose.Types.ObjectId(mentionedUserId) as any,
        feedPostId: feedReply.feedPostId as any,
        feedCommentId: feedReply.feedCommentId as any,
        feedReplyId: feedReply._id,
        senderId: replyUpdateUser._id,
        allUsers: [replyUpdateUser._id as any], // senderId must be in allUsers for old API compatibility
        notifyType: NotificationType.UserMentionedYouInACommentReply,
        notificationMsg: 'mentioned you in a reply',
      });
    }
  }
}
