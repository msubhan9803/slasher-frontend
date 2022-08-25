import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ActiveStatus, Device } from '../schemas/user.schema';
import { UserLoginDto } from './dto/user-login.dto';
import { UserRegisterDto } from './dto/user-register.dto';
import { UsersService } from './providers/users.service';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { pick } from '../utils/object-utils';
import { NotificationsService } from '../notifications/providers/notifications.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
    private readonly config: ConfigService,
  ) {}

  @Post('login')
  async login(@Body() userLoginDto: UserLoginDto) {
    const user = await this.usersService.findByEmailOrUsername(
      userLoginDto.emailOrUsername,
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

    if (!bcrypt.compareSync(userLoginDto.password, user.password)) {
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

    // Generate a device entry for this login
    const deviceEntry: Device = {
      login_date: new Date(),
      device_token: userLoginDto.device_token,
      device_type: userLoginDto.device_type,
      app_version: userLoginDto.app_version,
      device_version: userLoginDto.device_version,
      device_id: userLoginDto.device_id,
    };

    // During successful login, update certain fields and re-save the object:
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

  @Post('register')
  async register(@Body() userRegisterDto: UserRegisterDto) {
    console.log(`register`)
    const user = userRegisterDto
    console.log(`user = `, user)

    // user.save()
  }
}
