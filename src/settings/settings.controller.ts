import {
  Body,
  Controller, Get, HttpException, HttpStatus, Patch, Req, Version,
} from '@nestjs/common';
import { Request } from 'express';
import { pick } from '../utils/object-utils';
import { getUserFromRequest } from '../utils/request-utils';
import { UpdateNoticationSettingDto } from './dto/update-notification-setting.dto';
import { UserSettingsService } from './providers/user-settings.service';

@Controller({ path: 'settings', version: ['1'] })
export class SettingsController {
  constructor(
    private readonly userSettingsService: UserSettingsService,
  ) { }

  @Get('notifications')
  async getNotificationSettings(@Req() request: Request) {
    const user = getUserFromRequest(request);
    const userSetting = await this.userSettingsService.findByUserId(user.id);
    if (!userSetting) {
      throw new HttpException('User setting not found', HttpStatus.NOT_FOUND);
    }
    return pick(userSetting, ['_id', 'app_tutorial', 'dating_got_a_match',
      'dating_message_received', 'event_reminder', 'event_suggested',
      'feed_comment_on_post', 'feed_mention_on_post_comment_reply',
      'feed_post_like', 'friends_got_a_match', 'friends_message_received',
      'message_board_like_your_post', 'message_board_mention_on_comment_reply',
      'message_board_new_post_on_thread', 'message_board_reply_your_post',
      'movie_comment_on_reply', 'movie_comment_reply_like',
      'movie_mention_on_comment_reply', 'onboarding_completed',
      'rss_feed_mention_on_post_comment_reply', 'rss_feed_post_like',
    ]);
  }

  @Patch('notifications')
  async updateNotificationSettings(
    @Req() request: Request,
    @Body() updateNoticationSettingDto: UpdateNoticationSettingDto,
  ) {
    const user = getUserFromRequest(request);
    const userSetting = await this.userSettingsService.update(user.id, updateNoticationSettingDto);
    return pick(userSetting, ['_id', 'app_tutorial', 'dating_got_a_match',
      'dating_message_received', 'event_reminder', 'event_suggested',
      'feed_comment_on_post', 'feed_mention_on_post_comment_reply',
      'feed_post_like', 'friends_got_a_match', 'friends_message_received',
      'message_board_like_your_post', 'message_board_mention_on_comment_reply',
      'message_board_new_post_on_thread', 'message_board_reply_your_post',
      'movie_comment_on_reply', 'movie_comment_reply_like',
      'movie_mention_on_comment_reply', 'onboarding_completed',
      'rss_feed_mention_on_post_comment_reply', 'rss_feed_post_like',
    ]);
  }
}
