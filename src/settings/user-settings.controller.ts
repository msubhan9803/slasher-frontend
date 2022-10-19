import {
    Body,
    Controller, Get, HttpException, HttpStatus, Param, Patch, Post, Query, Req, UploadedFiles, UseInterceptors, ValidationPipe,
  } from '@nestjs/common';
  import { ConfigService } from '@nestjs/config';
  import { FilesInterceptor } from '@nestjs/platform-express';
  import { Request } from 'express';
  import mongoose from 'mongoose';
  import { LocalStorageService } from '../local-storage/providers/local-storage.service';
  import { S3StorageService } from '../local-storage/providers/s3-storage.service';
  import { getUserFromRequest } from '../utils/request-utils';
  import { CreateUserSettingDto } from './dto/create-user-setting.dto';
  import { UpdateNoticationSettingDto } from './dto/update-notification-setting.dto';
  import { ValidateUserIdDto } from './dto/validate-user-id.dto';
  import { UserSettingsService } from './providers/user-settings.service';
  import { UserSetting } from '../schemas/userSetting/userSetting.schema';
  import { defaultQueryDtoValidationPipeOptions } from '../utils/validation-utils';
  import { pick } from '../utils/object-utils';
  
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
      createSetting.userId = user._id
      const userSetting = await this.UserSettingsService.findUserSetting({userId:createSetting.userId});

      if (userSetting != null) {
        throw new HttpException('User setting already exists', HttpStatus.FOUND);
      }
      const create_setting = await this.UserSettingsService.create(createSetting);
      return create_setting
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
  