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
  ParseFilePipeBuilder,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import {
  Device,
  User,
  UserDocument,
} from '../schemas/user.schema';
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
import { ActiveStatus } from '../schemas/user.enums';
import { VerificationEmailNotReceivedDto } from './dto/verification-email-not-recevied.dto';
import { UpdateUserDto } from './dto/update-user-data.dto';
import { LocalStorageService } from '../local-storage/providers/local-storage.service';
import { S3StorageService } from '../local-storage/providers/s3-storage.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly config: ConfigService,
    private readonly mailService: MailService,
    private readonly localStorageService: LocalStorageService,
    private readonly s3StorageService: S3StorageService,
  ) { }

  @Post('sign-in')
  async signIn(@Body() userSignInDto: UserSignInDto) {
    const user = await this.usersService.findByEmailOrUsername(
      userSignInDto.emailOrUsername,
    );

    if (!user || user.deleted) {
      throw new HttpException(
        'Incorrect username or password.',
        HttpStatus.UNAUTHORIZED,
      );
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
    // TODO: Is there any reason we need to store the JWT in the db?
    // It's done in the old API, but it may not actually be necessary.
    // We'll keep this commented out for now, and uncomment later if needed.
    // user.token = `Bearer ${token}`;
    user.addOrUpdateDeviceEntry(deviceEntry);
    await user.save();

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
  async register(@Body() userRegisterDto: UserRegisterDto) {
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
    const registeredUser = await this.usersService.create(user);
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
    userDetails.save();
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
    userDetails.save();
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
      userData.save();
      await this.mailService.sendForgotPasswordEmail(
        userData.email,
        userData.resetPasswordToken,
      );
    }
    return {
      success: true,
    };
  }

  @Get('suggested-friends')
  async suggestedFriends(@Req() request: Request) {
    const user = getUserFromRequest(request);
    return this.usersService.getSuggestedFriends(user, 7); // for now, always return 7
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

  // eslint-disable-next-line class-methods-use-this
  @Get('initial-data')
  initialData(@Req() request: Request) {
    const user: UserDocument = getUserFromRequest(request);
    return {
      userName: user.userName,
      notificationCount: 6,
      recentMessages: [
        {
          profilePic: 'https://i.pravatar.cc/300?img=47',
          userName: 'MaureenBiologist',
          shortMessage: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse interdum, tortor vel consectetur blandit,'
            + 'justo diam elementum massa, id tincidunt risus turpis non nisi. Integer eu lorem risus.',
        },
        {
          profilePic: 'https://i.pravatar.cc/300?img=56',
          userName: 'TeriDactyl',
          shortMessage: 'Maecenas ornare sodales mi, sit amet pretium eros scelerisque quis.'
            + 'Nunc blandit mi elit, nec varius erat hendrerit ac. Nulla congue sollicitudin eleifend.',
        },
        {
          profilePic: 'https://i.pravatar.cc/300?img=26',
          userName: 'BobRoss',
          shortMessage: 'Aenean luctus ac magna lobortis varius. Ut laoreet arcu ac commodo molestie. Nulla facilisi.'
            + 'Sed porta sit amet nunc tempus sollicitudin. Pellentesque ac lectus pulvinar, pulvinar diam sed, semper libero.',
        },
      ],
      friendRequests: [
        {
          profilePic: 'https://i.pravatar.cc/300?img=12',
          userName: 'JackSkellington',
        },
        {
          profilePic: 'https://i.pravatar.cc/300?img=19',
          userName: 'Sally',
        },
        {
          profilePic: 'https://i.pravatar.cc/300?img=17',
          userName: 'OogieBoogie',
        },
      ],
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
      id: user.id,
      ...pick(userData, Object.keys(updateUserDto)),
    };
  }

  @Post('upload-profile-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfileImage(
    @Req() request: Request,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png)$/,
        })
        .addMaxSizeValidator({
          maxSize: 2e+7,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ) {
    const user = getUserFromRequest(request);
    const storageLocation = `/profile/profile_${file.filename}`;

    if (this.config.get<string>('FILE_STORAGE') === 's3') {
      await this.s3StorageService.write(storageLocation, file);
    } else {
      this.localStorageService.write(storageLocation, file);
    }

    user.profilePic = storageLocation;
    await user.save();

    // Delete original upload
    await fs.unlinkSync(file.path);
    return { success: true };
  }
}
