import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { Device, User } from '../schemas/user.schema';
import { UserLoginDto } from './dto/user-login.dto';
import { UsersService } from './users.service';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { pick } from '../utils/object-utils';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly config: ConfigService,
  ) {}

  // TODO: Remove this if not used
  @Get()
  async index(
    @Query('page') page: number,
    @Query('perPage') perPage: number,
  ): Promise<User[]> {
    return this.usersService.findAll(page, perPage);
  }

  // TODO: Remove this if not used
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

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

    if (user.status == '0') {
      throw new HttpException(
        'User account not yet activated.',
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
    user.token = `Bearer ${token}`;
    user.addOrUpdateDeviceEntry(deviceEntry);
    user.save();

    // Only return the subset of useful fields
    return pick(user, ['userName', 'email', 'firstName', 'token', 'zzz']);
  }
}
