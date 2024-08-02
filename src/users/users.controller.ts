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
  Put,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import mongoose from 'mongoose';
import { validate } from 'class-validator';
import { CaptchaService } from '../captcha/captcha.service';
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
import { defaultQueryDtoValidationPipeOptions } from '../utils/validation-utils';
import { getUserFromRequest } from '../utils/request-utils';
import { ActiveStatus, ProfileVisibility, UserType } from '../schemas/user/user.enums';
import { VerificationEmailNotReceivedDto } from './dto/verification-email-not-recevied.dto';
import { UpdateUserDto } from './dto/update-user-data.dto';
import { LocalStorageService } from '../local-storage/providers/local-storage.service';
import { S3StorageService } from '../local-storage/providers/s3-storage.service';
import { Device, User, UserDocument } from '../schemas/user/user.schema';
import { AllFeedPostQueryDto } from '../feed-posts/dto/all-feed-posts-query.dto';
import { FeedPostsService } from '../feed-posts/providers/feed-posts.service';
import { ParamUserIdDto } from './dto/param-user-id.dto';
import { MAXIMUM_IMAGE_UPLOAD_SIZE, SIMPLE_MONGODB_ID_REGEX, WELCOME_MSG } from '../constants';
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
import { FollowHashtagDto } from './dto/follow-hashtag.dto';
import { HashtagFollowsService } from '../hashtag-follows/providers/hashtag-follows.service';
import { HashtagService } from '../hashtag/providers/hashtag.service';
import { NotificationDto } from './dto/notification.dto';
import { IpOrForwardedIp } from '../app/decorators/ip-or-forwarded-ip.decorator';
import { HashtagsDto } from './dto/hashtags.dto';
import { HashtagQueryDto } from './dto/hashtag-query.dto';
import { BetaTestersService } from '../beta-tester/providers/beta-testers.service';
import { EmailRevertTokensService } from '../email-revert-tokens/providers/email-revert-tokens.service';
import { FriendRequestReaction } from '../schemas/friend/friend.enums';
import { Public } from '../app/guards/auth.guard';
import { UpdateDeviceTokenDto } from './dto/update-device-token.dto';
import { SignOutDto } from './dto/sign-out.dto';
import { ConfirmDeleteAccountQueryDto } from './dto/confirm-delete-account-query.dto';
import { FeedCommentsService } from '../feed-comments/providers/feed-comments.service';
import { BooksService } from '../books/providers/books.service';
import { FindAllBooksDto } from '../books/dto/find-all-books.dto';
import { MovieListTypeDto } from '../movies/dto/movie-list-type-dto';
import { BookListTypeDto } from '../books/dto/book-list-type-dto';

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
    private readonly feedCommentsService: FeedCommentsService,
    private readonly friendsService: FriendsService,
    private readonly userSettingsService: UserSettingsService,
    private readonly chatService: ChatService,
    private readonly blocksService: BlocksService,
    private readonly rssFeedProviderFollowsService: RssFeedProviderFollowsService,
    private readonly rssFeedProvidersService: RssFeedProvidersService,
    private readonly notificationsService: NotificationsService,
    private readonly disallowedUsernameService: DisallowedUsernameService,
    private readonly moviesService: MoviesService,
    private readonly hashtagFollowsService: HashtagFollowsService,
    private readonly hashtagService: HashtagService,
    private readonly booksService: BooksService,
    private readonly betaTestersService: BetaTestersService,
    private readonly emailRevertTokensService: EmailRevertTokensService,
    private configService: ConfigService,
    private captchaService: CaptchaService,
  ) { }

  commonBookListFields = ['_id', 'name', 'publishDate', 'coverImage', 'rating', 'worthReading'];

  @Post('sign-in')
  @Public()
  async signIn(@Body() userSignInDto: UserSignInDto, @IpOrForwardedIp() ip) {
    await sleep(500); // throttle so this endpoint is less likely to be abused

    let user = await this.usersService.findNonDeletedUserByEmailOrUsername(userSignInDto.emailOrUsername);

    if (!user) {
      throw new HttpException(
        'Incorrect username or password.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // We're no longer restricting login to beta testers, so this code is commented out.
    // TODO: We can probably remove this, but I'm keeping it here for a little while longer
    // in case we need to bring it back for any reason.
    // if (!user.betaTester) {
    //   const betaTester = await this.betaTestersService.findByEmail(user.email);
    //   if (betaTester) {
    //     // Since a BetaTester record was found for this user's email, mark them as a beta tester.
    //     user = await this.usersService.update(user.id, { betaTester: true });
    //   } else {
    //     throw new HttpException(
    //       'Only people who requested an invitation are able to sign in during the sneak preview.',
    //       HttpStatus.UNAUTHORIZED,
    //     );
    //   }
    // }

    if (user.userSuspended) {
      throw new HttpException('User suspended.', HttpStatus.UNAUTHORIZED);
    }

    if (user.userBanned) {
      throw new HttpException('User banned.', HttpStatus.UNAUTHORIZED);
    }

    // if (user.deleted) {
    //   throw new HttpException('User Deleted.', HttpStatus.UNAUTHORIZED);
    // }

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

    try {
      // During successful sign-in, update certain fields and re-save the object:
      user = await this.usersService.update(user.id, {
        last_login: new Date(),
        lastSignInIp: ip,
        // Store the user's latest token in the database.  This is mostly just done for compatibility
        // with the old API, which does the same thing, but we don't actually do any comparisons with
        // the database-stored version of the token in the new API app.
        token: `Bearer ${token}`,
        userDevices: user.generatedUpdatedDeviceEntryList(deviceEntry),
      });
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
      ]),
      token,
    };
  }

  @Get('validate-registration-fields')
  @Public()
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
      const available = await this.usersService.userNameAvailable(query.userName);
      if (!available) { requestedErrorsList.unshift('Username is already associated with an existing user.'); }

      const disallowedUsername = await this.disallowedUsernameService.findUserName(query.userName);
      if (disallowedUsername) { requestedErrorsList.unshift('Username is not available.'); }
    }
    if (requestedFields.includes('email') && !invalidFields.includes('email')) {
      // We're no longer restricting login to beta testers, so this code is commented out.
      // TODO: We can probably remove this, but I'm keeping it here for a little while longer
      // in case we need to bring it back for any reason.
      // const betaTester = await this.betaTestersService.findByEmail(userRegisterDto.email);
      // if (!betaTester) {
      //   requestedErrorsList.unshift('Only people who requested an invitation are able to register during the sneak preview.');
      // }

      const available = await this.usersService.emailAvailable(query.email);
      if (!available) { requestedErrorsList.unshift('Email address is already associated with an existing user.'); }
    }

    return requestedErrorsList;
  }

  @Post('register')
  @Public()
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

    // We're no longer restricting login to beta testers, so this code is commented out.
    // TODO: We can probably remove this, but I'm keeping it here for a little while longer
    // in case we need to bring it back for any reason.
    // const betaTester = await this.betaTestersService.findByEmail(userRegisterDto.email);
    // if (!betaTester) {
    //   throw new HttpException(
    //     'Only people who requested an invitation are able to register during the sneak preview.',
    //     HttpStatus.BAD_REQUEST,
    //   );
    // }

    if (!await this.usersService.userNameAvailable(userRegisterDto.userName)) {
      throw new HttpException(
        'Username is already associated with an existing user.',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    if (!await this.usersService.emailAvailable(userRegisterDto.email)) {
      throw new HttpException(
        'Email address is already associated with an existing user.',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const captchaVerified = await this.captchaService.verifyReCaptchaToken(userRegisterDto.reCaptchaToken);
    if (!captchaVerified.success) {
      throw new HttpException(
        'Captcha validation failed. Please try again.',
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
      registeredUser.id,
      registeredUser.verification_token,
    );
    return { id: registeredUser.id };
  }

  @Get('validate-password-reset-token')
  @Public()
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
  @Public()
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    const isValid = await this.usersService.resetPasswordTokenIsValid(
      resetPasswordDto.email,
      resetPasswordDto.resetPasswordToken,
    );
    if (isValid === false) {
      throw new HttpException('Invalid password reset token.', HttpStatus.BAD_REQUEST);
    }
    const userDetails = await this.usersService.findByEmail(resetPasswordDto.email, true);
    userDetails.setUnhashedPassword(resetPasswordDto.newPassword);
    userDetails.resetPasswordToken = null;
    userDetails.lastPasswordResetTime = new Date();
    await userDetails.save();
    return {
      message: 'Password reset successfully',
    };
  }

  @Post('activate-account')
  @Public()
  async activateAccount(@Body() activateAccountDto: ActivateAccountDto) {
    let user = await this.usersService.findById(activateAccountDto.userId, false);
    if (user && !user.deleted) {
      // If user is already active, return a successful response.
      if (user.status === ActiveStatus.Active) {
        return { success: true };
      }

      // If user verification token matches, run activation setup steps and return a successful response.
      if (user.verification_token === activateAccountDto.token) {
        // If we made it here, go forward with activation.
        user = await this.usersService.update(user.id, {
          status: ActiveStatus.Active,
          verification_token: null,
        });

        const userConversationData = await this.chatService.sendPrivateDirectMessage(
          this.config.get<string>('WELCOME_MESSAGE_SENDER_USER_ID'),
          user.id,
          WELCOME_MSG,
        );

        await this.usersService.addAndUpdateNewConversationId(user.id, userConversationData.matchId.toString());

        const autoFollowRssFeedProviders = await this.rssFeedProvidersService.findAllAutoFollowRssFeedProviders();
        autoFollowRssFeedProviders.forEach((rssFeedProvider) => {
          this.rssFeedProviderFollowsService.create({
            rssfeedProviderId: rssFeedProvider._id,
            userId: user._id,
          });
        });
        return { success: true };
      }
    }

    throw new HttpException('Token is not valid', HttpStatus.BAD_REQUEST);
  }

  @Post('forgot-password')
  @Public()
  @HttpCode(200)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    await sleep(500); // throttle so this endpoint is less likely to be abused
    const userData = await this.usersService.findByEmail(forgotPasswordDto.email, true);
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

  @Get('recent-movies')
  async recentMovies(@Req() request: Request) {
    const user = getUserFromRequest(request);
    const movies = await this.moviesService.getRecentAddedMovies(user, 10);

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
      (movie) => pick(movie, ['_id', 'name', 'logo', 'releaseDate', 'rating', 'worthWatching']),
    );
  }

  @TransformImageUrls('$[*].coverImage.image_path')
  @Get('recent-books')
  async recentBooks(@Req() request: Request) {
    const user = getUserFromRequest(request);
    const books = await this.booksService.getRecentAddedBooks(user, 10);

    return books.map((bookData) => pick(
      bookData,
      ['_id', 'name', 'publishDate', 'coverImage', 'rating', 'worthReading'],
    ));
  }

  @Post('verification-email-not-received')
  @Public()
  @HttpCode(200)
  async verificationEmailNotReceived(@Body() verificationEmailNotReceivedDto: VerificationEmailNotReceivedDto) {
    await sleep(500); // throttle so this endpoint is less likely to be abused
    const userData = await this.usersService.findInactiveUserByEmail(verificationEmailNotReceivedDto.email);

    // Only send email if the user exists and a verification token exists
    if (userData && userData.verification_token) {
      await this.mailService.sendVerificationEmail(
        userData.email,
        userData.id,
        userData.verification_token,
      );
    }

    // Always return success so that we don't inform the user whether or not there is an account
    // with this email address on Slasher.
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
    // Note: Below, we retrieve more conversations than we need because deleted conversations are
    // currently retrieved by this method, so we
    const recentMessages: any = (await this.chatService.getUnreadConversations(user.id)).slice(0, 3);
    const receivedFriendRequestsData = await this.friendsService.getReceivedFriendRequests(user.id, 3);
    const unreadNotificationCount = await this.notificationsService.getUnreadNotificationCount(user.id);
    const friendRequestCount = await this.friendsService.getReceivedFriendRequestCount(user.id);
    return {
      user: pick(user, ['id', 'userName', 'profilePic', 'newNotificationCount',
        'newFriendRequestCount', 'ignoreFriendSuggestionDialog', 'userType']),
      recentMessages,
      recentFriendRequests: receivedFriendRequestsData,
      unreadNotificationCount,
      newConversationIdsCount: user.newConversationIds.length,
      friendRequestCount,
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
    const excludedUserIds = await this.blocksService.getUserIdsForBlocksToOrFromUser(user.id);
    return this.usersService.suggestUserName(query.query, query.limit, true, excludedUserIds);
  }

  @TransformImageUrls('$.profilePic', '$.coverPhoto')
  @Get(':userNameOrId')
  async findOne(@Req() request: Request, @Param('userNameOrId') userNameOrId: string) {
    const loggedInUser = getUserFromRequest(request);
    let user: UserDocument;
    if (SIMPLE_MONGODB_ID_REGEX.test(userNameOrId)) {
      user = await this.usersService.findById(userNameOrId, true);
    } else {
      user = await this.usersService.findByUsername(userNameOrId, true);
    }
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const block = await this.blocksService.blockExistsBetweenUsers(loggedInUser.id, user.id);
    if (block) {
      throw new HttpException('User not found', HttpStatus.FORBIDDEN);
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

    if (user.profile_status === ProfileVisibility.Private
      && (loggedInUser.id !== user.id && (friendshipStatus as any).reaction !== FriendRequestReaction.Accepted)) {
      user.aboutMe = null;
    }
    // Get `friendsCount`, `postsCount`, `photosCount` of the user
    const imagesCount = await this.feedPostsService.getAllPostsImagesCountByUser(user.id);
    const postsCount = await this.feedPostsService.getFeedPostsCountByUser(user.id);
    const friendsCount = await this.friendsService.getActiveFriendCount(user.id, [FriendRequestReaction.Accepted]);
    const watchedListMovieCount = await this.moviesService.getMovieListCountForUser(user.id, 'watched');

    const pickFields = ['_id', 'firstName', 'userName', 'profilePic', 'coverPhoto', 'aboutMe', 'profile_status'];

    // expose email to loggged in user only, when logged in user requests own user record
    if (loggedInUser.id === user.id) {
      pickFields.push('email');
      pickFields.push('unverifiedNewEmail');
    }

    return {
      ...pick(user, pickFields),
      friendshipStatus,
      imagesCount,
      postsCount,
      friendsCount,
      watchedListMovieCount,
    };
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

    let changingUserName = false;
    if (updateUserDto.userName && updateUserDto.userName !== user.userName) {
      changingUserName = true;
      if (!await this.usersService.userNameAvailable(updateUserDto.userName)) {
        throw new HttpException(
          'Username is already associated with an existing user.',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
    }

    const additionalFieldsToUpdate: Partial<User> = {};

    if (changingUserName) {
      if (user.lastUserNameUpdatedAt) {
        const currentDate = new Date();
        const lastDate = user.lastUserNameUpdatedAt;
        const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays < 30) {
          throw new HttpException(
            `You can update username after ${30 - diffDays} days`,
            HttpStatus.BAD_REQUEST,
          );
        }
      }
      additionalFieldsToUpdate.userName = updateUserDto.userName;
      additionalFieldsToUpdate.previousUserName = user.previousUserName ? user.previousUserName : [];
      additionalFieldsToUpdate.previousUserName.push(user.userName);
      additionalFieldsToUpdate.lastUserNameUpdatedAt = new Date();
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      // Check if new email address is already used by another account. If so, throw exception.
      if (!await this.usersService.emailAvailable(updateUserDto.email)) {
        throw new HttpException(
          'Email address is already associated with an existing user.',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      // If new email address is available (not used by another user), then we'll assign
      // it to the unverified email address field and and send verification emails to both
      // the new AND old addresses.
      additionalFieldsToUpdate.unverifiedNewEmail = updateUserDto.email;
      additionalFieldsToUpdate.emailChangeToken = uuidv4();
      // And we'll make sure that the old email address is retained in the existing email field
      // during our upcoming update.
      additionalFieldsToUpdate.email = user.email;

      // And generate an email revert token, using the user's current (old) email as the email to revert to
      const emailRevertToken = await this.emailRevertTokensService.create(user.id, uuidv4(), user.email);

      // And we'll retain the current email, so we'll clear out the dto value
      this.mailService.sendEmailChangeConfirmationEmails(
        user.id,
        additionalFieldsToUpdate.email,
        additionalFieldsToUpdate.unverifiedNewEmail,
        additionalFieldsToUpdate.emailChangeToken,
        emailRevertToken.value,
      );
    } else {
      // If newly supplied email address matches existing email, make sure to clear out the
      // unverifiedNewEmail field.
      additionalFieldsToUpdate.unverifiedNewEmail = null;
    }

    // if (changingUserName) {
    //   // TODO (SD-1336): When user is allowed to update username, remove `throw` below
    //   throw new HttpException(
    //     'You can edit your username after July 31, 2023',
    //     HttpStatus.BAD_REQUEST,
    //   );

    //   // TODO (SD-1336): When user is allowed to update username, uncomment lines below
    //   // await this.usersService.removePreviousUsernameEntry(updateUserDto.userName);
    //   // additionalFieldsToUpdate.previousUserName = user.userName;
    // }

    if (updateUserDto.profile_status !== undefined && user.profile_status !== updateUserDto.profile_status) {
      await this.feedPostsService.updatePostPrivacyType(user.id, updateUserDto.profile_status);
    }

    const userData = await this.usersService.update(id, { ...updateUserDto, ...additionalFieldsToUpdate });
    await Promise.all([
      this.feedPostsService.updateMessageInFeedposts(userData.id, userData.userName),
      this.feedCommentsService.updateMessageInFeedcomments(userData.id, userData.userName),
      this.feedCommentsService.updateMessageInFeedreplies(userData.id, userData.userName),
    ]);

    return {
      _id: user.id,
      ...pick(userData, Object.keys(updateUserDto)),
      // If a user email update was attempted, and it resulted in an unverifiedNewEmail, return the unverifiedNewEmail too
      ...(updateUserDto.email && userData.unverifiedNewEmail ? { unverifiedNewEmail: userData.unverifiedNewEmail } : {}),
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

  @TransformImageUrls('$[*].images[*].image_path', '$[*].userId.profilePic', '$[*].bookId.coverImage.image_path')
  @Get(':userId/posts')
  async allFeedPosts(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    param: ParamUserIdDto,
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    query: AllFeedPostQueryDto,
  ) {
    const loggedInUser = getUserFromRequest(request);
    const user = await this.usersService.findById(param.userId, true);
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
      loggedInUser.id,
      query.before ? new mongoose.Types.ObjectId(query.before) : undefined,
    );

    for (let i = 0; i < feedPosts.length; i += 1) {
      const findActiveHashtags = await this.hashtagService.findActiveHashtags(feedPosts[i].hashtags);
      feedPosts[i].hashtags = findActiveHashtags.map((hashtag) => hashtag.name);
    }

    return feedPosts.map(
      (post) => pick(
        post,
        ['_id', 'message', 'images', 'userId', 'createdAt',
          'likedByUser', 'likeCount', 'commentCount', 'movieId', 'hashtags', 'bookId', 'postType'],
      ),
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
    const user = await this.usersService.findById(param.userId, true);
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
    const user = await this.usersService.findById(param.userId, true);
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

  @Get(':userId/watched-list')
  async watchedListMovies(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    param: ParamUserIdDto,
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    query: FindAllMoviesDto,
  ) {
    const loggedInUser = getUserFromRequest(request);
    const user = await this.usersService.findById(param.userId, true);
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
      if (movie.type === 2) {
        // eslint-disable-next-line no-param-reassign
        movie.logo = relativeToFullImagePath(this.configService, movie.movieImage);
        return;
      }
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
      (movie) => pick(movie, ['_id', 'name', 'logo', 'releaseDate', 'rating', 'worthWatching']),
    );
  }

  @Get(':userId/watch-list')
  async watchListMovies(
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    param: ParamUserIdDto,
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    query: FindAllMoviesDto,
  ) {
    const user = await this.usersService.findById(param.userId, true);
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
      if (movie.type === 2) {
        // eslint-disable-next-line no-param-reassign
        movie.logo = relativeToFullImagePath(this.configService, movie.movieImage);
        return;
      }
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
      (movie) => pick(movie, ['_id', 'name', 'logo', 'releaseDate', 'rating', 'worthWatching']),
    );
  }

  @Get(':userId/buy-list')
  async buyListMovies(
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    param: ParamUserIdDto,
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    query: FindAllMoviesDto,
  ) {
    const user = await this.usersService.findById(param.userId, true);
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
      if (movie.type === 2) {
        // eslint-disable-next-line no-param-reassign
        movie.logo = relativeToFullImagePath(this.configService, movie.movieImage);
        return;
      }
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
      (movie) => pick(movie, ['_id', 'name', 'logo', 'releaseDate', 'rating', 'worthWatching']),
    );
  }

  @Get(':userId/favorite-list')
  async favoriteListMovies(
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    param: ParamUserIdDto,
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    query: FindAllMoviesDto,
  ) {
    const user = await this.usersService.findById(param.userId, true);
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
      if (movie.type === 2) {
        // eslint-disable-next-line no-param-reassign
        movie.logo = relativeToFullImagePath(this.configService, movie.movieImage);
        return;
      }
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
      (movie) => pick(movie, ['_id', 'name', 'logo', 'releaseDate', 'rating', 'worthWatching']),
    );
  }

  @Get(':userId/movie-list-count')
  async getMovieListCount(
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    param: ParamUserIdDto,
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    query: MovieListTypeDto,
  ) {
    const user = await this.usersService.findById(param.userId, true);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const { type } = query;
    const count = await this.moviesService.getMovieListCountForUser(user.id, type);

    return count;
  }

  @Get(':userId/book-list-count')
  async getBookListCount(
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    param: ParamUserIdDto,
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    query: BookListTypeDto,
  ) {
    const user = await this.usersService.findById(param.userId, true);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const { type } = query;
    const count = await this.booksService.getBookListCountForUser(user.id, type);

    return count;
  }

  @TransformImageUrls('$[*].coverImage.image_path')
  @Get(':userId/reading-booklist')
  async readingListBooks(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    param: ParamUserIdDto,
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    query: FindAllBooksDto,
  ) {
    const loggedInUser = getUserFromRequest(request);
    const user = await this.usersService.findById(param.userId, true);
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
    const readingMovieIds = await this.booksService.getReadingListBookIdsForUser(param.userId);
    const books = await this.booksService.findAll(
      query.limit,
      true,
      query.sortBy,
      query.after ? new mongoose.Types.ObjectId(query.after) : undefined,
      query.nameContains,
      readingMovieIds as unknown as mongoose.Types.ObjectId[],
      query.startsWith,
    );

    return books.map(
      (book) => pick(book, this.commonBookListFields),
    );
  }

  @TransformImageUrls('$[*].coverImage.image_path')
  @Get(':userId/read-booklist')
  async readListBook(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    param: ParamUserIdDto,
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    query: FindAllBooksDto,
  ) {
    const loggedInUser = getUserFromRequest(request);
    const user = await this.usersService.findById(param.userId, true);
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
    const readBookIds = await this.booksService.getReadListBookIdsForUser(param.userId);
    const books = await this.booksService.findAll(
      query.limit,
      true,
      query.sortBy,
      query.after ? new mongoose.Types.ObjectId(query.after) : undefined,
      query.nameContains,
      readBookIds as unknown as mongoose.Types.ObjectId[],
      query.startsWith,
    );
    return books.map(
      (book) => pick(book, this.commonBookListFields),
    );
  }

  @TransformImageUrls('$[*].coverImage.image_path')
  @Get(':userId/buy-booklist')
  async buyListBooks(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    param: ParamUserIdDto,
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    query: FindAllBooksDto,
  ) {
    const loggedInUser = getUserFromRequest(request);
    const user = await this.usersService.findById(param.userId, true);
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
    const buyBookIds = await this.booksService.getBuyListBookIdsForUser(param.userId);

    const books = await this.booksService.findAll(
      query.limit,
      true,
      query.sortBy,
      query.after ? new mongoose.Types.ObjectId(query.after) : undefined,
      query.nameContains,
      buyBookIds as unknown as mongoose.Types.ObjectId[],
      query.startsWith,
    );

    return books.map(
      (book) => pick(book, this.commonBookListFields),
    );
  }

  @TransformImageUrls('$[*].coverImage.image_path')
  @Get(':userId/favorite-booklist')
  async favoriteListBooks(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    param: ParamUserIdDto,
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    query: FindAllBooksDto,
  ) {
    const loggedInUser = getUserFromRequest(request);
    const user = await this.usersService.findById(param.userId, true);
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
    const favoriteBookIds = await this.booksService.getFavoriteListBookIdsForUser(param.userId);
    const books = await this.booksService.findAll(
      query.limit,
      true,
      query.sortBy,
      query.after ? new mongoose.Types.ObjectId(query.after) : undefined,
      query.nameContains,
      favoriteBookIds as unknown as mongoose.Types.ObjectId[],
      query.startsWith,
    );
    return books.map(
      (book) => pick(book, this.commonBookListFields),
    );
  }

  @Post('update-device-token')
  async updateDeviceToken(
    @Req() request: Request,
    @Body() updateDeviceTokenDto: UpdateDeviceTokenDto,
  ) {
    const user = getUserFromRequest(request);
    const updatedDeviceToken = await this.usersService.findOneAndUpdateDeviceToken(
      user.id,
      updateDeviceTokenDto.device_id,
      updateDeviceTokenDto.device_token,
    );
    if (!updatedDeviceToken) {
      throw new HttpException('Device id not found', HttpStatus.BAD_REQUEST);
    }
    return { success: true };
  }

  @Post('sign-out')
  async signOut(@Req() request: Request, @Body() signOutDto: SignOutDto) {
    const user = getUserFromRequest(request);
    const deviceId = await this.usersService.findByDeviceId(signOutDto.device_id, user.id);
    if (deviceId) {
      const userDevices = user.userDevices.filter((device) => device.device_id !== signOutDto.device_id);
      user.userDevices = userDevices;
      user.save();
    } else {
      throw new HttpException('Device id is not found', HttpStatus.BAD_REQUEST);
    }
    return { success: true };
  }

  // TODO: Delete this after the app and website have been updated.
  // It wil be replaced by the deleteAccount method in this class.
  @Delete('delete-account')
  async deleteAccountDeprecated(
    @Req() request: Request,
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) query: DeleteAccountQueryDto,
  ) {
    const user = getUserFromRequest(request);

    // We check user id against the DTO data to make it harder to accidentally delete an account.
    // This is important because users cannot undo account deletion.
    if (user.id !== query.userId) {
      throw new HttpException("Supplied userId param does not match current user's id.", HttpStatus.BAD_REQUEST);
    }

    await this.usersService.delete(user.id);

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

  @Delete(':userId')
  async deleteAccount(
    @Req() request: Request,
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    query: ConfirmDeleteAccountQueryDto,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    param: ParamUserIdDto,
  ) {
    const requestingUser = getUserFromRequest(request);
    let userToDelete: UserDocument;

    if (requestingUser.id === param.userId) {
      // User is deleting their own account
      userToDelete = requestingUser;
    } else if (requestingUser.userType === UserType.Admin) {
      // Admin is deleting any user's account
      userToDelete = await this.usersService.findById(param.userId, false);
    } else {
      throw new HttpException('You are not allowed to perform this action.', HttpStatus.FORBIDDEN);
    }

    if (!userToDelete) {
      throw new HttpException('User not found.', HttpStatus.NOT_FOUND);
    }

    // We check user id against an additional DTO query param to make it harder to accidentally
    // delete an account. This is important because account deletion is NOT reversible.
    if (userToDelete.id !== query.confirmUserId) {
      throw new HttpException("Supplied confirmUserId param does not match user's id.", HttpStatus.BAD_REQUEST);
    }

    if (!userToDelete.deleted) {
      await this.usersService.delete(userToDelete.id);
    }

    return {
      success: true,
    };
  }

  @Get(':userId/hashtag-follows')
  async fetchAllUserFollowedHashtag(

    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: ParamUserIdDto,
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    query: HashtagQueryDto,
  ) {
    const user = getUserFromRequest(request);
    if (user.id !== params.userId) { throw new HttpException('Not authorized', HttpStatus.UNAUTHORIZED); }

    const hashtagFollowsData = await this.hashtagFollowsService.findAllByUserId(params.userId);
    if (!(hashtagFollowsData && hashtagFollowsData.length)) {
      throw new HttpException('Hashtag follow not found', HttpStatus.NOT_FOUND);
    }

    const hashtagId: any = hashtagFollowsData.map((hashtag) => (hashtag.hashTagId as any)._id);

    const hashtagsData = await this.hashtagService.findAllHashtagById(hashtagId, query.limit, query.query, query.offset);

    const hashtagFollows = [];
    for (const follow of hashtagFollowsData) {
      const hashtag = hashtagsData.find(({ _id }) => _id.toString() === (follow.hashTagId as any)._id.toString());
      if (hashtag) {
        const hashtags: any = {};
        hashtags.notification = follow.notification;
        hashtags.userId = follow.userId;
        hashtags.hashTagId = hashtag;
        hashtagFollows.push(hashtags);
      }
    }
    return hashtagFollows;
  }

  @Get(':userId/hashtag-follows/:hashtag')
  async fetchUserFollowedHashtag(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: FollowHashtagDto,
  ) {
    const user = getUserFromRequest(request);
    if (user.id !== params.userId) { throw new HttpException('Not authorized', HttpStatus.UNAUTHORIZED); }

    const hashtag = await this.hashtagService.findByHashTagName(params.hashtag, true);
    if (!hashtag) {
      throw new HttpException('Hashtag not found', HttpStatus.NOT_FOUND);
    }

    const hashtagFollows = await this.hashtagFollowsService.findByUserAndHashtag(params.userId, hashtag._id.toString());
    if (!hashtagFollows) {
      throw new HttpException('Hashtag follow not found', HttpStatus.NOT_FOUND);
    }
    return pick(hashtagFollows, ['notification', 'hashTagId']);
  }

  @Put(':userId/hashtag-follows/:hashtag')
  async createOrUpdateHashtagFollow(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: FollowHashtagDto,
    @Body() notificationDto: NotificationDto,
  ) {
    const user = getUserFromRequest(request);
    if (user.id !== params.userId) { throw new HttpException('Not authorized', HttpStatus.UNAUTHORIZED); }

    const hashtag = await this.hashtagService.findByHashTagName(params.hashtag, true);
    if (!hashtag) {
      throw new HttpException('Hashtag not found', HttpStatus.NOT_FOUND);
    }

    const hashtagFollow = await this.hashtagFollowsService.findOneAndUpdateHashtagFollow(
      user.id,
      hashtag._id.toString(),
      notificationDto.notification,
    );

    return pick(hashtagFollow, ['notification', 'userId', 'hashTagId']);
  }

  @Delete(':userId/hashtag-follows/:hashtag')
  async deleteHashtagsFollow(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: FollowHashtagDto,
  ) {
    const user = getUserFromRequest(request);
    if (user.id !== params.userId) { throw new HttpException('Not authorized', HttpStatus.UNAUTHORIZED); }

    const hashtag = await this.hashtagService.findByHashTagName(params.hashtag, true);
    if (!hashtag) {
      throw new HttpException('Hashtag not found', HttpStatus.NOT_FOUND);
    }

    const hashtagFollows = await this.hashtagFollowsService.findByUserAndHashtag(user.id, hashtag._id.toString());
    if (hashtagFollows) {
      await this.hashtagFollowsService.deleteById(hashtagFollows._id.toString());
    }
    return { success: true };
  }

  @Post(':userId/hashtag-follows')
  async insertManyHashtagFollow(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: ParamUserIdDto,
    @Body() hashtagsDto: HashtagsDto,
  ) {
    const user = getUserFromRequest(request);
    if (user.id !== params.userId) { throw new HttpException('Not authorized', HttpStatus.UNAUTHORIZED); }

    const hashtagData = await this.hashtagService.findAllHashTagName(hashtagsDto.hashtags);
    const hashtags = hashtagsDto.hashtags.filter((hashtag) => !hashtagData.map((hashtagName) => hashtagName.name).includes(hashtag));
    if (hashtags.length) {
      throw new HttpException(`${hashtags} hashtag not found`, HttpStatus.NOT_FOUND);
    }
    const hashtagIds = hashtagData.map((hashtag) => hashtag._id.toString());
    const hashtagFollows = await this.hashtagFollowsService.insertManyHashtagFollow(user.id, hashtagIds);
    return hashtagFollows.map(
      (follow) => pick(follow, ['notification', 'userId', 'hashTagId']),
    );
  }

  @Put('ignoreFriendSuggestionDialog')
  async hideFriendShipModel(@Req() request: Request) {
    const user = getUserFromRequest(request);
    await this.usersService.ignoreFriendSuggestionDialog(user.id);
    return { success: true };
  }
}
