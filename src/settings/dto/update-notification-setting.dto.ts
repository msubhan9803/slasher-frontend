import {
  IsOptional, IsEnum
} from 'class-validator';
import { UserSettingNotificationStatus } from '../../schemas/userSetting/userSetting.enums';

export class UpdateNoticationSettingDto {

  @IsOptional()
  onboarding_completed: boolean;

  @IsOptional()
  @IsEnum(UserSettingNotificationStatus)
  dating_got_a_match: UserSettingNotificationStatus;

  @IsOptional()
  @IsEnum(UserSettingNotificationStatus)
  dating_message_received: UserSettingNotificationStatus;

  @IsOptional()
  @IsEnum(UserSettingNotificationStatus)
  friends_got_a_match: UserSettingNotificationStatus;

  @IsOptional()
  @IsEnum(UserSettingNotificationStatus)
  friends_message_received: UserSettingNotificationStatus;

  @IsOptional()
  @IsEnum(UserSettingNotificationStatus)
  message_board_like_your_post: UserSettingNotificationStatus;

  @IsOptional()
  @IsEnum(UserSettingNotificationStatus)
  message_board_reply_your_post: UserSettingNotificationStatus;

  @IsOptional()
  @IsEnum(UserSettingNotificationStatus)
  message_board_new_post_on_thread: UserSettingNotificationStatus;

  @IsOptional()
  @IsEnum(UserSettingNotificationStatus)
  feed_mention_on_post_comment_reply: UserSettingNotificationStatus;

  @IsOptional()
  @IsEnum(UserSettingNotificationStatus)
  feed_post_like: UserSettingNotificationStatus;

  @IsOptional()
  @IsEnum(UserSettingNotificationStatus)
  feed_comment_on_post: UserSettingNotificationStatus;
}
