/* eslint-disable max-lines */
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Query,
  ValidationPipe,
  Req,
  Param,
  Patch,
  UploadedFile,
  UseInterceptors,
  Delete,
  Ip,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import mongoose from 'mongoose';
import { UserSignInDto } from './dto/user-sign-in.dto';
import { UserRegisterDto } from './dto/user-register.dto';
import { UsersService } from './providers/users.service';
import { pick } from '../utils/object-utils';
import { sleep } from '../utils/timer-utils';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ValidatePasswordResetTokenDto } from './dto/validate-password-reset-token.dto';
import { ActivateAccountDto } from './dto/user-activate-account.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { MailService } from '../providers/mail.service';
import { CheckUserNameQueryDto } from './dto/check-user-name-query.dto';
import { CheckEmailQueryDto } from './dto/check-email-query.dto';
import { defaultQueryDtoValidationPipeOptions } from '../utils/validation-utils';
import { getUserFromRequest } from '../utils/request-utils';
import { ActiveStatus } from '../schemas/user/user.enums';
import { VerificationEmailNotReceivedDto } from './dto/verification-email-not-recevied.dto';
import { UpdateUserDto } from './dto/update-user-data.dto';
import { LocalStorageService } from '../local-storage/providers/local-storage.service';
import { S3StorageService } from '../local-storage/providers/s3-storage.service';
import { Device, User, UserDocument } from '../schemas/user/user.schema';
import { AllFeedPostQueryDto } from '../feed-posts/dto/all-feed-posts-query.dto';
import { FeedPostsService } from '../feed-posts/providers/feed-posts.service';
import { ParamUserIdDto } from './dto/param-user-id.dto';
import { SIMPLE_MONGODB_ID_REGEX } from '../constants';
import { SuggestUserNameQueryDto } from './dto/suggest-user-name-query.dto';
import { asyncDeleteMulterFiles, createProfileOrCoverImageParseFilePipeBuilder } from '../utils/file-upload-validation-utils';
import { GetFriendsDto } from './dto/get-friends.dto';
import { FriendsService } from '../friends/providers/friends.service';
import { TransformImageUrls } from '../app/decorators/transform-image-urls.decorator';
import { UserSettingsService } from '../settings/providers/user-settings.service';
import { ChatService } from '../chat/providers/chat.service';
import { DeleteAccountQueryDto } from './dto/delete-account-query.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { BlocksService } from '../blocks/providers/blocks.service';
import { RssFeedProviderFollowsService } from '../rss-feed-provider-follows/providers/rss-feed-provider-follows.service';
import { RssFeedProvidersService } from '../rss-feed-providers/providers/rss-feed-providers.service';
import { NotificationsService } from '../notifications/providers/notifications.service';
import { StorageLocationService } from '../global/providers/storage-location.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly config: ConfigService,
    private readonly mailService: MailService,
    private readonly localStorageService: LocalStorageService,
    private readonly s3StorageService: S3StorageService,
    private readonly storageLocationService: StorageLocationService,
    private readonly feedPostsService: FeedPostsService,
    private readonly friendsService: FriendsService,
    private readonly userSettingsService: UserSettingsService,
    private readonly chatService: ChatService,
    private readonly blocksService: BlocksService,
    private readonly rssFeedProviderFollowsService: RssFeedProviderFollowsService,
    private readonly rssFeedProvidersService: RssFeedProvidersService,
    private readonly notificationsService: NotificationsService,
  ) { }

  @Post('sign-in')
  async signIn(@Body() userSignInDto: UserSignInDto, @Ip() ip) {
    const user = await this.usersService.findByEmailOrUsername(
      userSignInDto.emailOrUsername,
    );

    if (!user || user.deleted) {
      throw new HttpException(
        'Incorrect username or password.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // This is temporary, but required during the beta release phase
    if (!user.betaTester) {
      throw new HttpException('Only beta testers are able to sign in at this time, sorry!', HttpStatus.UNAUTHORIZED);
    }

    if (user.userSuspended) {
      throw new HttpException('User suspended.', HttpStatus.UNAUTHORIZED);
    }

    if (user.userBanned) {
      throw new HttpException('User banned.', HttpStatus.UNAUTHORIZED);
    }

    if (!bcrypt.compareSync(userSignInDto.password, user.password)) {
      throw new HttpException(
        'Incorrect username or password.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (user.status !== ActiveStatus.Active) {
      if (user.status === ActiveStatus.Inactive) {
        throw new HttpException(
          'User account not yet activated.',
          HttpStatus.UNAUTHORIZED,
        );
      }

      throw new HttpException(
        'User account has been deactivated.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Generate a JWT token
    const token = user.generateNewJwtToken(
      this.config.get<string>('JWT_SECRET_KEY'),
    );

    // Generate a device entry for this session
    const deviceEntry: Device = {
      login_date: new Date(),
      device_token: userSignInDto.device_token,
      device_type: userSignInDto.device_type,
      app_version: userSignInDto.app_version,
      device_version: userSignInDto.device_version,
      device_id: userSignInDto.device_id,
    };

    // During successful sign-in, update certain fields and re-save the object:
    user.last_login = new Date();
    user.lastSignInIp = ip;

    // Store the user's latest token in the database.  This is mostly just done for compatibility
    // with the old API, which does the same thing, but we don't actually do any comparisons with
    // the database-stored version of the token.
    user.token = `Bearer ${token}`;
    user.addOrUpdateDeviceEntry(deviceEntry);
    try {
      await user.save();
    } catch (e) {
      if (e.name !== 'MongoServerError') {
        // Handle db read-only scenario. But if it's another type of unexpected exception
        // then we should re-throw it.
        throw e;
      }
    }

    // Only return the subset of useful fields
    return {

      ...pick(user, [
        'id',
        'userName',
        'email',
        'firstName',
        // 'token',
      ]),
      token,
    };
  }

  @Get('check-user-name')
  async checkUserName(
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    query: CheckUserNameQueryDto,
  ) {
    await sleep(500); // throttle so this endpoint is less likely to be abused
    return {
      exists: await this.usersService.userNameExists(query.userName),
    };
  }

  @Get('check-email')
  async checkEmail(
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    query: CheckEmailQueryDto,
  ) {
    await sleep(500); // throttle so this endpoint is less likely to be abused
    return {
      exists: await this.usersService.emailExists(query.email),
    };
  }

  @Post('register')
  async register(@Body() userRegisterDto: UserRegisterDto, @Ip() ip) {
    await sleep(500); // throttle so this endpoint is less likely to be abused
    if (await this.usersService.userNameExists(userRegisterDto.userName)) {
      throw new HttpException(
        'Username is already associated with an existing user.',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    if (await this.usersService.emailExists(userRegisterDto.email)) {
      throw new HttpException(
        'Email address is already associated with an existing user.',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const user = new User(userRegisterDto);
    user.setUnhashedPassword(userRegisterDto.password);
    user.verification_token = uuidv4();
    user.registrationIp = ip; // save registration IP to detect malicious user activity
    const registeredUser = await this.usersService.create(user);

    // Create associated UserSetting record with default values
    await this.userSettingsService.create({ userId: registeredUser.id });

    await this.mailService.sendVerificationEmail(
      registeredUser.email,
      registeredUser.verification_token,
    );
    return { id: registeredUser.id };
  }

  @Get('validate-password-reset-token')
  async validatePasswordResetToken(
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    query: ValidatePasswordResetTokenDto,
  ) {
    const isValid = await this.usersService.resetPasswordTokenIsValid(
      query.email,
      query.resetPasswordToken,
    );
    return { valid: isValid };
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    const isValid = await this.usersService.resetPasswordTokenIsValid(
      resetPasswordDto.email,
      resetPasswordDto.resetPasswordToken,
    );
    if (isValid === false) {
      throw new HttpException('User does not exists.', HttpStatus.BAD_REQUEST);
    }
    const userDetails = await this.usersService.findByEmail(
      resetPasswordDto.email,
    );
    userDetails.setUnhashedPassword(resetPasswordDto.newPassword);
    userDetails.resetPasswordToken = null;
    userDetails.lastPasswordResetTime = new Date();
    await userDetails.save();
    return {
      message: 'Password reset successfully',
    };
  }

  @Post('activate-account')
  async activateAccount(@Body() activateAccountDto: ActivateAccountDto) {
    const isValid = await this.usersService.verificationTokenIsValid(
      activateAccountDto.email,
      activateAccountDto.verification_token,
    );
    if (isValid === false) {
      throw new HttpException('Token is not valid', HttpStatus.BAD_REQUEST);
    }
    const userDetails = await this.usersService.findByEmail(
      activateAccountDto.email,
    );
    userDetails.status = ActiveStatus.Active;
    userDetails.verification_token = null;
    await userDetails.save();
    const autoFollowRssFeedProviders = await this.rssFeedProvidersService.findAllAutoFollowRssFeedProviders();
    autoFollowRssFeedProviders.forEach((rssFeedProvider) => {
      this.rssFeedProviderFollowsService.create({
        rssfeedProviderId: rssFeedProvider._id,
        userId: userDetails._id,
      });
    });
    return {
      success: true,
    };
  }

  @Post('forgot-password')
  @HttpCode(200)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    await sleep(500); // throttle so this endpoint is less likely to be abused
    const userData = await this.usersService.findByEmail(
      forgotPasswordDto.email,
    );
    if (userData) {
      userData.resetPasswordToken = uuidv4();
      await userData.save();
      await this.mailService.sendForgotPasswordEmail(
        userData.email,
        userData.resetPasswordToken,
      );
    }
    return {
      success: true,
    };
  }

  @TransformImageUrls('$[*].profilePic')
  @Get('suggested-friends')
  async suggestedFriends(@Req() request: Request) {
    const user = getUserFromRequest(request);
    return this.friendsService.getSuggestedFriends(user, 7); // for now, always return 7
  }

  @Post('verification-email-not-received')
  @HttpCode(200)
  async verificationEmailNotReceived(@Body() verificationEmailNotReceivedDto: VerificationEmailNotReceivedDto) {
    await sleep(500); // throttle so this endpoint is less likely to be abused
    const userData = await this.usersService.findByEmail(
      verificationEmailNotReceivedDto.email,
    );
    if (userData) {
      await this.mailService.sendVerificationEmail(
        userData.email,
        userData.verification_token,
      );
    }
    return {
      success: true,
    };
  }

  @TransformImageUrls(
    '$.recentFriendRequests[*].profilePic',
    '$.recentMessages[*].participants[*].profilePic',
    '$.user.profilePic',
  )
  @Get('initial-data')
  async initialData(@Req() request: Request) {
    // TODO: For better performance and to reduce load on the database, we may want to
    // look into caching some initial-data items later on (and then building appropriate
    // cache invalidation mechanisms).
    const user: UserDocument = getUserFromRequest(request);
    const recentMessages: any = await this.chatService.getConversations(user._id, 3);
    const receivedFriendRequestsData = await this.friendsService.getReceivedFriendRequests(user._id, 3);
    const friendRequestCount = await this.friendsService.getReceivedFriendRequestCount(user._id);
    const unreadNotificationCount = await this.notificationsService.getUnreadNotificationCount(user._id);
    const unreadMessageCount = await this.chatService.getUnreadDirectPrivateMessageCount(user._id);
    return {
      user: pick(user, ['id', 'userName', 'profilePic']),
      recentMessages,
      recentFriendRequests: receivedFriendRequestsData,
      friendRequestCount,
      unreadNotificationCount,
      unreadMessageCount,
    };
  }

  @Get('suggest-user-name')
  async suggestUserName(
    @Req() request: Request,
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    query: SuggestUserNameQueryDto,
  ) {
    const user = getUserFromRequest(request);
    const excludedUserIds = await this.blocksService.getBlockedUserIdsBySender(user._id);
    excludedUserIds.push(user._id);
    return this.usersService.suggestUserName(query.query, query.limit, true, excludedUserIds);
  }

  @TransformImageUrls('$.profilePic', '$.coverPhoto')
  @Get(':userNameOrId')
  async findOne(@Req() request: Request, @Param('userNameOrId') userNameOrId: string) {
    const loggedInUser = getUserFromRequest(request);
    let user: UserDocument;
    if (SIMPLE_MONGODB_ID_REGEX.test(userNameOrId)) {
      user = await this.usersService.findById(userNameOrId);
    } else {
      user = await this.usersService.findByUsername(userNameOrId);
    }
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const block = await this.blocksService.blockExistsBetweenUsers(loggedInUser.id, user.id);
    if (block) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const pickFields = ['_id', 'firstName', 'userName', 'profilePic', 'coverPhoto', 'aboutMe', 'profile_status'];

    // expose email to loggged in user only, when logged in user requests own user record
    if (loggedInUser.id === user.id) pickFields.push('email');

    return pick(user, pickFields);
  }

  // eslint-disable-next-line class-methods-use-this
  @Patch('change-password')
  async changePassword(@Req() request: Request, @Body() changePasswordDto: ChangePasswordDto) {
    const user = getUserFromRequest(request);

    if (!bcrypt.compareSync(changePasswordDto.currentPassword, user.password)) {
      throw new HttpException(
        'Invalid value supplied for current password.',
        HttpStatus.BAD_REQUEST,
      );
    }

    user.setUnhashedPassword(changePasswordDto.newPassword);
    user.lastPasswordResetTime = new Date();
    await user.save();

    return {
      success: true,
    };
  }

  @Patch(':id')
  async update(@Req() request: Request, @Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = getUserFromRequest(request);
    if (user.id !== id) {
      throw new HttpException('You are not allowed to do this action', HttpStatus.FORBIDDEN);
    }

    if (updateUserDto.userName !== user.userName && await this.usersService.userNameExists(updateUserDto.userName)) {
      throw new HttpException(
        'Username is already associated with an existing user.',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    if (updateUserDto.email !== user.email && await this.usersService.emailExists(updateUserDto.email)) {
      throw new HttpException(
        'Email address is already associated with an existing user.',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const userData = await this.usersService.update(id, updateUserDto);
    return {
      _id: user.id,
      ...pick(userData, Object.keys(updateUserDto)),
    };
  }

  @Post('upload-profile-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfileImage(
    @Req() request: Request,
    @UploadedFile(createProfileOrCoverImageParseFilePipeBuilder())
    file: Express.Multer.File,
  ) {
    const user = getUserFromRequest(request);

    const storageLocation = this.storageLocationService.generateNewStorageLocationFor('profile', file.filename);
    if (this.config.get<string>('FILE_STORAGE') === 's3') {
      await this.s3StorageService.write(storageLocation, file);
    } else {
      this.localStorageService.write(storageLocation, file);
    }

    user.profilePic = storageLocation;
    await user.save();

    asyncDeleteMulterFiles([file]);
    return { success: true };
  }

  @TransformImageUrls('$[*].images[*].image_path', '$[*].userId.profilePic')
  @Get(':userId/posts')
  async allFeedPosts(
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    param: ParamUserIdDto,
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    query: AllFeedPostQueryDto,
  ) {
    const user = await this.usersService.findById(param.userId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const feedPosts = await this.feedPostsService.findAllByUser(
      user._id,
      query.limit,
      true,
      query.before ? new mongoose.Types.ObjectId(query.before) : undefined,
    );
    return feedPosts.map(
      (post) => pick(post, ['_id', 'messages', 'images', 'userId', 'createdAt', 'likes', 'likeCount', 'commentCount']),
    );
  }

  @TransformImageUrls('$.friends[*].profilePic')
  @Get(':userId/friends')
  async getFriends(
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    param: ParamUserIdDto,
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) query: GetFriendsDto,
  ) {
    const user = await this.usersService.findById(param.userId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return this.friendsService.getFriends(user.id, query.limit, query.offset, query.userNameContains);
  }

  @Post('upload-cover-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCoverImage(
    @Req() request: Request,
    @UploadedFile(createProfileOrCoverImageParseFilePipeBuilder())
    file: Express.Multer.File,
  ) {
    const user = getUserFromRequest(request);

    const storageLocation = this.storageLocationService.generateNewStorageLocationFor('cover', file.filename);
    if (this.config.get<string>('FILE_STORAGE') === 's3') {
      await this.s3StorageService.write(storageLocation, file);
    } else {
      this.localStorageService.write(storageLocation, file);
    }

    user.coverPhoto = storageLocation;
    await user.save();

    asyncDeleteMulterFiles([file]);
    return { success: true };
  }

  @TransformImageUrls('$[*].images[*].image_path', '$[*].userId.profilePic')
  @Get(':userId/posts-with-images')
  async allFeedPostsWithImages(
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    param: ParamUserIdDto,
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    query: AllFeedPostQueryDto,
  ) {
    const user = await this.usersService.findById(param.userId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const feedPosts = await this.feedPostsService.findAllPostsWithImagesByUser(
      user._id,
      query.limit,
      query.before ? new mongoose.Types.ObjectId(query.before) : undefined,
    );
    return feedPosts.map(
      (post) => pick(post, ['_id', 'images']),
    );
  }

  @Delete('delete-account')
  async deleteAccount(
    @Req() request: Request,
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) query: DeleteAccountQueryDto,
  ) {
    const user = getUserFromRequest(request);

    // We check user id against the DTO data to make it harder to accidentally delete an account.
    // This is important because users cannot undo account deletion.
    if (user.id !== query.userId) {
      throw new HttpException(
        'Supplied userId does not match current user\'s id.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // This is to remove all friendships and pending friend requests related to this user.
    await this.friendsService.deleteAllByUserId(user.id);

    // No need to keep suggested friend blocks to or from this user when their account is deleted.
    await this.friendsService.deleteAllSuggestBlocksByUserId(user.id);

    // No need to keep blocks from or to the user.  It's especially important to delete
    // blocks to the user because we don't want this now-deleted user showing up in other
    // users' block lists in the UI.
    await this.blocksService.deleteAllByUserId(user.id);

    // Mark user as deleted
    user.deleted = true;

    // Change user's password to a new random value, to ensure that current session is invalidated
    // and that they cannot log in again if admins ever need to temporarily reactivate their account.
    user.setUnhashedPassword(uuidv4());

    // Save changes to user object
    await user.save();

    return {
      success: true,
    };
  }
}
