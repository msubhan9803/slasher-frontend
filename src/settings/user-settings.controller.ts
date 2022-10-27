import {
    Body,
    Controller, Get, HttpException, HttpStatus, Patch, Req,
  } from '@nestjs/common';
  import { ConfigService } from '@nestjs/config';
  import { Request } from 'express';
  import { getUserFromRequest } from '../utils/request-utils';
  // import { CreateUserSettingDto } from './dto/create-user-setting.dto';?
  import { UpdateNoticationSettingDto } from './dto/update-notification-setting.dto';
  import { UserSettingsService } from './providers/user-settings.service';
  import { UserSetting } from '../schemas/userSetting/userSetting.schema';

  @Controller('settings')
  export class SettingController {
 constructor(
        private readonly userSettingsService: UserSettingsService,
        private readonly config: ConfigService,
    ) { }

  // @Post('create-user-settings')
      async createUserSettings(
@Req() request: Request,
      @Body() userSettingData: Partial<UserSetting>,
    ) {
      const user = getUserFromRequest(request);
      const createSetting = new UserSetting(userSettingData);
      createSetting.userId = user._id;
      const userSetting = await this.userSettingsService.findByUserId(user._id);

      if (userSetting != null) {
        throw new HttpException('User setting already exists', HttpStatus.FOUND);
      }
      const saveSetting = await this.userSettingsService.create(createSetting);
      return saveSetting;
    }

    @Get('notifications')
      async getNotificationSettings(@Req() request: Request) {
        const user = getUserFromRequest(request);
        const userSetting = await this.userSettingsService.findByUserId(user._id);
        if (!userSetting) {
          throw new HttpException('User setting not found', HttpStatus.NOT_FOUND);
        }
        return userSetting;
    }

    @Patch('notifications')
      async updateNotificationSettings(
    @Req() request: Request,
          @Body() updateNoticationSettingDto: UpdateNoticationSettingDto,
        ) {
          const user = getUserFromRequest(request);
          const userSetting = await this.userSettingsService.update(user._id, updateNoticationSettingDto);
          return userSetting;
        }
  }
