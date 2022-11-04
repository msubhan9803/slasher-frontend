import {
  Body,
  Controller, Get, HttpException, HttpStatus, Patch, Req,
} from '@nestjs/common';
import { Request } from 'express';
import { getUserFromRequest } from '../utils/request-utils';
import { UpdateNoticationSettingDto } from './dto/update-notification-setting.dto';
import { UserSettingsService } from './providers/user-settings.service';

@Controller('settings')
export class SettingsController {
  constructor(
    private readonly userSettingsService: UserSettingsService,
  ) { }

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
