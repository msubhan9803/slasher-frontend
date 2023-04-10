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
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import mongoose from 'mongoose';
import { validate } from 'class-validator';
import { UserSignInDto } from './dto/user-sign-in.dto';
import { UserRegisterDto } from './dto/user-register.dto';
import { UsersService } from './providers/users.service';
import { pick, pickDefinedKeys } from '../utils/object-utils';
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
import { ActiveStatus, ProfileVisibility } from '../schemas/user/user.enums';
import { VerificationEmailNotReceivedDto } from './dto/verification-email-not-recevied.dto';
import { UpdateUserDto } from './dto/update-user-data.dto';
import { LocalStorageService } from '../local-storage/providers/local-storage.service';
import { S3StorageService } from '../local-storage/providers/s3-storage.service';
import { Device, User, UserDocument } from '../schemas/user/user.schema';
import { AllFeedPostQueryDto } from '../feed-posts/dto/all-feed-posts-query.dto';
import { FeedPostsService } from '../feed-posts/providers/feed-posts.service';
import { ParamUserIdDto } from './dto/param-user-id.dto';
import { MAXIMUM_IMAGE_UPLOAD_SIZE, SIMPLE_MONGODB_ID_REGEX } from '../constants';
import { SuggestUserNameQueryDto } from './dto/suggest-user-name-query.dto';
import { defaultFileInterceptorFileFilter } from '../utils/file-upload-utils';
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
import { RegisterUser } from '../types';
import { DisallowedUsernameService } from '../disallowedUsername/providers/disallowed-username.service';
import { MoviesService } from '../movies/providers/movies.service';
import { FindAllMoviesDto } from '../movies/dto/find-all-movies.dto';
import { relativeToFullImagePath } from '../utils/image-utils';
import { IpOrForwardedIp } from '../app/decorators/ip-or-forwarded-ip.decorator';

@Controller({ path: 'users', version: ['1'] })
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
    private readonly disallowedUsernameService: DisallowedUsernameService,
    private readonly moviesService: MoviesService,
    private configService: ConfigService,
  ) { }

  @Post('sign-in')
  async signIn(@Body() userSignInDto: UserSignInDto, @IpOrForwardedIp() ip) {
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
    const exists = await this.usersService.userNameExists(query.userName);
    return { exists };
  }

  @Get('check-email')
  async checkEmail(
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    query: CheckEmailQueryDto,
  ) {
    await sleep(500); // throttle so this endpoint is less likely to be abused
    const exists = await this.usersService.emailExists(query.email);
    return { exists };
  }

  @Get('validate-registration-fields')
  async validateRegistrationFields(@Query() inputQuery) {
    await sleep(500); // throttle so this endpoint is less likely to be abused
    if (Object.keys(inputQuery).length === 0) {
      throw new HttpException(
        'You must provide at least one field for validation.',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    const query: RegisterUser = pickDefinedKeys(inputQuery, [
      'firstName', 'userName', 'email', 'password',
      'passwordConfirmation', 'securityQuestion', 'securityAnswer', 'dob',
    ]);

    const requestedFields = Object.keys(query);

    const userRegisterDto = new UserRegisterDto();
    Object.assign(userRegisterDto, query);

    const errors: any = await validate(userRegisterDto);
    const requestedErrors = errors.filter((e) => requestedFields.includes(e.property));

    const invalidFields = requestedErrors.map((e: any) => e.property);
    const requestedErrorsList = requestedErrors.map((e) => Object.values(e.constraints)).flat();

    if (requestedFields.includes('userName') && !invalidFields.includes('userName')) {
      const exists = await this.usersService.userNameExists(query.userName);
      if (exists) { requestedErrorsList.unshift('Username is already associated with an existing user.'); }

      const disallowedUsername = await this.disallowedUsernameService.findUserName(query.userName);
      if (disallowedUsername) { requestedErrorsList.unshift('Username is not available.'); }
    }
    if (requestedFields.includes('email') && !invalidFields.includes('email')) {
      const exists = await this.usersService.emailExists(query.email);
      if (exists) { requestedErrorsList.unshift('Email address is already associated with an existing user.'); }
    }

    return requestedErrorsList;
  }

  @Post('register')
  async register(@Body() userRegisterDto: UserRegisterDto, @IpOrForwardedIp() ip) {
    await sleep(500); // throttle so this endpoint is less likely to be abused

    // TODO: Move values below into the database instead of hard-coding here
    const hardCodedDisallowedUsernames = [
      'app',
      'pages',
      'admin',
      'go',
      'slasher.tv',
    ];

    if (
      hardCodedDisallowedUsernames.includes(userRegisterDto.userName)
      || await this.disallowedUsernameService.findUserName(userRegisterDto.userName)
    ) {
      throw new HttpException(
        'Username is not available',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

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
      registeredUser.firstName,
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
        userData.firstName,
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
    const recentMessages: any = await this.chatService.getConversations(user.id, 3);
    const receivedFriendRequestsData = await this.friendsService.getReceivedFriendRequests(user.id, 3);
    const friendRequestCount = await this.friendsService.getReceivedFriendRequestCount(user.id);
    const unreadNotificationCount = await this.notificationsService.getUnreadNotificationCount(user.id);
    const unreadMessageCount = await this.chatService.getUnreadDirectPrivateMessageCount(user.id);
    return {
      user: pick(user, ['id', 'userName', 'profilePic']),
      recentMessages,
      recentFriendRequests: receivedFriendRequestsData,
      friendRequestCount,
      unreadNotificationCount,
      unreadMessageCount,
    };
  }

  @TransformImageUrls('$[*].profilePic')
  @Get('suggest-user-name')
  async suggestUserName(
    @Req() request: Request,
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    query: SuggestUserNameQueryDto,
  ) {
    const user = getUserFromRequest(request);
    // Note: We are allowing a user to look up their own username when getting user suggestions.
    const excludedUserIds = await this.blocksService.getBlockedUserIdsBySender(user.id);
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

    let friend;
    if (loggedInUser.id !== user.id) {
      friend = await this.friendsService.findFriendship(user.id, loggedInUser.id);
    }
    const friendshipStatus = friend ? pick(friend, ['reaction', 'from', 'to']) : {
      reaction: null,
      from: null,
      to: null,
    };

    const pickFields = ['_id', 'firstName', 'userName', 'profilePic', 'coverPhoto', 'aboutMe', 'profile_status'];

    // expose email to loggged in user only, when logged in user requests own user record
    if (loggedInUser.id === user.id) { pickFields.push('email'); }

    return { ...pick(user, pickFields), friendshipStatus };
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

    if (updateUserDto.userName
      && updateUserDto.userName !== user.userName
      && await this.usersService.userNameExists(updateUserDto.userName)
    ) {
      throw new HttpException(
        'Username is already associated with an existing user.',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    if (updateUserDto.email && updateUserDto.email !== user.email && await this.usersService.emailExists(updateUserDto.email)) {
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

  @TransformImageUrls('$.profilePic')
  @Post('profile-image')
  @UseInterceptors(FileInterceptor(
    'file',
    {
      fileFilter: defaultFileInterceptorFileFilter,
      limits: {
        fileSize: MAXIMUM_IMAGE_UPLOAD_SIZE,
      },
    },
  ))
  async uploadProfileImage(
    @Req() request: Request,
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    if (!file) { throw new HttpException('File is required', HttpStatus.BAD_REQUEST); }

    const user = getUserFromRequest(request);

    const storageLocation = this.storageLocationService.generateNewStorageLocationFor('profile', file.filename);
    if (this.config.get<string>('FILE_STORAGE') === 's3') {
      await this.s3StorageService.write(storageLocation, file);
    } else {
      this.localStorageService.write(storageLocation, file);
    }

    user.profilePic = storageLocation;
    await user.save();

    return { profilePic: user.profilePic };
  }

  @TransformImageUrls('$[*].images[*].image_path', '$[*].userId.profilePic')
  @Get(':userId/posts')
  async allFeedPosts(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    param: ParamUserIdDto,
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    query: AllFeedPostQueryDto,
  ) {
    const loggedInUser = getUserFromRequest(request);
    const user = await this.usersService.findById(param.userId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    if (loggedInUser.id !== user.id && user.profile_status !== ProfileVisibility.Public) {
      const areFriends = await this.friendsService.areFriends(loggedInUser.id, user.id);
      if (!areFriends) {
        throw new HttpException('You must be friends with this user to perform this action.', HttpStatus.FORBIDDEN);
      }
    }
    const block = await this.blocksService.blockExistsBetweenUsers(loggedInUser.id, user.id);
    if (block) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const feedPosts = await this.feedPostsService.findAllByUser(
      user.id,
      query.limit,
      true,
      query.before ? new mongoose.Types.ObjectId(query.before) : undefined,
    );
    return feedPosts.map(
      (post) => pick(post, ['_id', 'message', 'images', 'userId', 'createdAt', 'likedByUser', 'likeCount', 'commentCount']),
    );
  }

  @TransformImageUrls('$.friends[*].profilePic')
  @Get(':userId/friends')
  async getFriends(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    param: ParamUserIdDto,
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) query: GetFriendsDto,
  ) {
    const loggedInUser = getUserFromRequest(request);
    const user = await this.usersService.findById(param.userId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    if (loggedInUser.id !== user.id && user.profile_status !== ProfileVisibility.Public) {
      const areFriends = await this.friendsService.areFriends(loggedInUser.id, user.id);
      if (!areFriends) {
        throw new HttpException('You must be friends with this user to perform this action.', HttpStatus.FORBIDDEN);
      }
    }
    const block = await this.blocksService.blockExistsBetweenUsers(loggedInUser.id, user.id);
    if (block) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return this.friendsService.getFriends(user.id, query.limit, query.offset, query.userNameContains);
  }

  @TransformImageUrls('$.coverPhoto')
  @Post('cover-image')
  @UseInterceptors(FileInterceptor(
    'file',
    {
      fileFilter: defaultFileInterceptorFileFilter,
      limits: {
        fileSize: MAXIMUM_IMAGE_UPLOAD_SIZE,
      },
    },
  ))
  async uploadCoverImage(
    @Req() request: Request,
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    if (!file) { throw new HttpException('File is required', HttpStatus.BAD_REQUEST); }

    const user = getUserFromRequest(request);

    const storageLocation = this.storageLocationService.generateNewStorageLocationFor('cover', file.filename);
    if (this.config.get<string>('FILE_STORAGE') === 's3') {
      await this.s3StorageService.write(storageLocation, file);
    } else {
      this.localStorageService.write(storageLocation, file);
    }

    user.coverPhoto = storageLocation;
    await user.save();

    return { coverPhoto: user.coverPhoto };
  }

  @TransformImageUrls('$[*].images[*].image_path', '$[*].userId.profilePic')
  @Get(':userId/posts-with-images')
  async allFeedPostsWithImages(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    param: ParamUserIdDto,
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    query: AllFeedPostQueryDto,
  ) {
    const loggedInUser = getUserFromRequest(request);
    const user = await this.usersService.findById(param.userId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (loggedInUser.id !== user.id && user.profile_status !== ProfileVisibility.Public) {
      const areFriends = await this.friendsService.areFriends(loggedInUser.id, user.id);
      if (!areFriends) {
        throw new HttpException('You must be friends with this user to perform this action.', HttpStatus.FORBIDDEN);
      }
    }
    const block = await this.blocksService.blockExistsBetweenUsers(loggedInUser.id, user.id);
    if (block) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const feedPosts = await this.feedPostsService.findAllPostsWithImagesByUser(
      user.id,
      query.limit,
      query.before ? new mongoose.Types.ObjectId(query.before) : undefined,
    );
    return feedPosts.map(
      (post) => pick(post, ['_id', 'images', 'createdAt']),
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

  // eslint-disable-next-line class-methods-use-this
  @TransformImageUrls('$.profilePic')
  @Delete('profile-image')
  async deleteProfileImage(
    @Req() request: Request,
  ) {
    const user = getUserFromRequest(request);
    // TODO: Would be good to delete old image before replacing it (if previous value exists), to save storage space.
    user.profilePic = 'noUser.jpg';
    await user.save();
    return { profilePic: user.profilePic };
  }

  // eslint-disable-next-line class-methods-use-this
  @TransformImageUrls('$.profilePic')
  @Delete('cover-image')
  async deleteCoverImage(
    @Req() request: Request,
  ) {
    const user = getUserFromRequest(request);
    // TODO: Would be good to delete old image before replacing it (if previous value exists), to save storage space.
    user.coverPhoto = null;
    await user.save();
    return { coverPhoto: user.coverPhoto };
  }

  @Get(':userId/watched-list')
  async watchedListMovies(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    param: ParamUserIdDto,
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    query: FindAllMoviesDto,
  ) {
    const loggedInUser = getUserFromRequest(request);
    const user = await this.usersService.findById(param.userId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (loggedInUser.id !== user.id && user.profile_status !== ProfileVisibility.Public) {
      const areFriends = await this.friendsService.areFriends(loggedInUser.id, user.id);
      if (!areFriends) {
        throw new HttpException('You must be friends with this user to perform this action.', HttpStatus.FORBIDDEN);
      }
    }
    const block = await this.blocksService.blockExistsBetweenUsers(loggedInUser.id, user.id);
    if (block) {
      throw new HttpException('Request failed due to user block.', HttpStatus.NOT_FOUND);
    }
    const watchedMovieIds = await this.moviesService.getWatchedListMovieIdsForUser(param.userId);
    const movies = await this.moviesService.findAll(
      query.limit,
      true,
      query.sortBy,
      query.after ? new mongoose.Types.ObjectId(query.after) : undefined,
      query.nameContains,
      watchedMovieIds as unknown as mongoose.Types.ObjectId[],
      query.startsWith,
    );
    movies.forEach((movie) => {
      if (movie.logo?.length > 1) {
        // eslint-disable-next-line no-param-reassign
        movie.logo = `https://image.tmdb.org/t/p/w220_and_h330_face${movie.logo}`;
      }
      if (movie.logo === null) {
        // eslint-disable-next-line no-param-reassign
        movie.logo = relativeToFullImagePath(this.configService, '/placeholders/movie_poster.png');
      }
    });
    return movies.map(
      (movie) => pick(movie, ['_id', 'name', 'logo', 'releaseDate', 'rating']),
    );
  }

  @Get(':userId/watch-list')
  async watchListMovies(
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    param: ParamUserIdDto,
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    query: FindAllMoviesDto,
  ) {
    const user = await this.usersService.findById(param.userId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const watchMovieIds = await this.moviesService.getWatchListMovieIdsForUser(param.userId);
    const movies = await this.moviesService.findAll(
      query.limit,
      true,
      query.sortBy,
      query.after ? new mongoose.Types.ObjectId(query.after) : undefined,
      query.nameContains,
      watchMovieIds as unknown as mongoose.Types.ObjectId[],
      query.startsWith,
    );
    movies.forEach((movie) => {
      if (movie.logo?.length > 1) {
        // eslint-disable-next-line no-param-reassign
        movie.logo = `https://image.tmdb.org/t/p/w220_and_h330_face${movie.logo}`;
      }
      if (movie.logo === null) {
        // eslint-disable-next-line no-param-reassign
        movie.logo = relativeToFullImagePath(this.configService, '/placeholders/movie_poster.png');
      }
    });
    return movies.map(
      (movie) => pick(movie, ['_id', 'name', 'logo', 'releaseDate', 'rating']),
    );
  }

  @Get(':userId/buy-list')
  async buyListMovies(
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    param: ParamUserIdDto,
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    query: FindAllMoviesDto,
  ) {
    const user = await this.usersService.findById(param.userId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const buyMovieIds = await this.moviesService.getBuyListMovieIdsForUser(param.userId);

    const movies = await this.moviesService.findAll(
      query.limit,
      true,
      query.sortBy,
      query.after ? new mongoose.Types.ObjectId(query.after) : undefined,
      query.nameContains,
      buyMovieIds as unknown as mongoose.Types.ObjectId[],
      query.startsWith,
    );
    movies.forEach((movie) => {
      if (movie.logo?.length > 1) {
        // eslint-disable-next-line no-param-reassign
        movie.logo = `https://image.tmdb.org/t/p/w220_and_h330_face${movie.logo}`;
      }
      if (movie.logo === null) {
        // eslint-disable-next-line no-param-reassign
        movie.logo = relativeToFullImagePath(this.configService, '/placeholders/movie_poster.png');
      }
    });
    return movies.map(
      (movie) => pick(movie, ['_id', 'name', 'logo', 'releaseDate', 'rating']),
    );
  }

  @Get(':userId/favorite-list')
  async favoriteListMovies(
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    param: ParamUserIdDto,
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    query: FindAllMoviesDto,
  ) {
    const user = await this.usersService.findById(param.userId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const favoriteMovieIds = await this.moviesService.getFavoriteListMovieIdsForUser(param.userId);

    const movies = await this.moviesService.findAll(
      query.limit,
      true,
      query.sortBy,
      query.after ? new mongoose.Types.ObjectId(query.after) : undefined,
      query.nameContains,
      favoriteMovieIds as unknown as mongoose.Types.ObjectId[],
      query.startsWith,
    );
    movies.forEach((movie) => {
      if (movie.logo?.length > 1) {
        // eslint-disable-next-line no-param-reassign
        movie.logo = `https://image.tmdb.org/t/p/w220_and_h330_face${movie.logo}`;
      }
      if (movie.logo === null) {
        // eslint-disable-next-line no-param-reassign
        movie.logo = relativeToFullImagePath(this.configService, '/placeholders/movie_poster.png');
      }
    });
    return movies.map(
      (movie) => pick(movie, ['_id', 'name', 'logo', 'releaseDate', 'rating']),
    );
  }
}
