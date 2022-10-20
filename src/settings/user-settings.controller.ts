import {
    Body,
    Controller, Get, HttpException, HttpStatus, Patch, Post, Req,
  } from '@nestjs/common';
  import { ConfigService } from '@nestjs/config';
  import { Request } from 'express';
  import { getUserFromRequest } from '../utils/request-utils';
  import { CreateUserSettingDto } from './dto/create-user-setting.dto';
  import { UpdateNoticationSettingDto } from './dto/update-notification-setting.dto';
  import { UserSettingsService } from './providers/user-settings.service';
  import { UserSetting } from '../schemas/userSetting/userSetting.schema';
  
  @Controller('settings')
  export class UserSettingController { constructor(
        private readonly UserSettingsService: UserSettingsService,
        private readonly config: ConfigService
    ) { }

    @Post('create-user-settings')
      async createUserSettings(@Req() request: Request,
      @Body() CreateUserSettingDto: CreateUserSettingDto,
    ) {
      const user = getUserFromRequest(request);
      const createSetting = new UserSetting(CreateUserSettingDto);
      createSetting.userId = user._id;
      const userSetting = await this.UserSettingsService.findUserSetting({ userId:createSetting.userId });

      if (userSetting != null) {
        throw new HttpException('User setting already exists', HttpStatus.FOUND);
      }
      const saveSetting = await this.UserSettingsService.create(createSetting);
      return saveSetting;
    }

    @Get('notifications')
      async getNotificationSettings(@Req() request: Request) {
        const user = getUserFromRequest(request);
        const eventData = await this.UserSettingsService.findByUserId(user._id);
        if (!eventData) {
          throw new HttpException('User setting not found', HttpStatus.NOT_FOUND);
        }
        return eventData;
    }

    @Patch('update-notification-settings')
      async updateNotificationSettings(@Req() request: Request,
      @Body() UpdateNoticationSettingDto: UpdateNoticationSettingDto,
    ) {
      const user = getUserFromRequest(request);
      const eventData = await this.UserSettingsService.update(user._id, UpdateNoticationSettingDto);
      return eventData
    }
  }