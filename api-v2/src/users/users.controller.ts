import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ActiveStatus, Device } from '../schemas/user.schema';
import { UserSignInDto } from './dto/user-sign-in.dto';
import { UsersService } from './providers/users.service';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { pick } from '../utils/object-utils';
import { NotificationsService } from '../notifications/providers/notifications.service';
import { validateEmail } from '../utils/email-utils';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
    private readonly config: ConfigService,
  ) {}

  @Post('sign-in')
  async signIn(@Body() userSignInDto: UserSignInDto) {
    const user = await this.usersService.findByEmailOrUsername(
      userSignInDto.emailOrUsername,
    );

    if (!user || user.deleted) {
      throw new HttpException('User does not exist.', HttpStatus.UNAUTHORIZED);
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

    if (user.status != ActiveStatus.Active) {
      if (user.status == ActiveStatus.Inactive) {
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
    user.save();

    // Only return the subset of useful fields
    return Object.assign(
      {},
      pick(user, [
        'userName',
        'email',
        'firstName',
        // 'token',
      ]),
      { token },
    );
  }

  @Post('checkEmail/:email')
  async checkEmail(@Param('email') email: string) {
    const emailValidation = validateEmail(email);
    if (!emailValidation) {
      return {
        message: 'email must be an email',
        valid: false,
        exists: false,
      };
    }
    const userData = await this.usersService.checkEmail(email);
    if (userData) {
      return {
        message: 'Email is already exists',
        exists: true,
        valid: true,
      };
    } else {
      return {
        message: 'Email is not exists',
        exists: false,
        valid: true,
      };
    }
  }
}
