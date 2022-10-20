import {
  IsOptional
} from 'class-validator';
import { UserSettingNotificationStatus } from '../../schemas/userSetting/userSetting.enums';

export class CreateUserSettingDto {
  @IsOptional()
  onboarding_completed: boolean;

  @IsOptional()
  dating_got_a_match: UserSettingNotificationStatus;

  @IsOptional()
  dating_message_received: UserSettingNotificationStatus;

  @IsOptional()
  friends_got_a_match: UserSettingNotificationStatus;

  @IsOptional()
  friends_message_received: UserSettingNotificationStatus;

  @IsOptional()
  message_board_like_your_post: UserSettingNotificationStatus;

  @IsOptional()
  message_board_reply_your_post: UserSettingNotificationStatus;

  @IsOptional()
  message_board_new_post_on_thread: UserSettingNotificationStatus;

  @IsOptional()
  feed_mention_on_post_comment_reply: UserSettingNotificationStatus;

  @IsOptional()
  feed_post_like: UserSettingNotificationStatus;

  @IsOptional()
  feed_comment_on_post: UserSettingNotificationStatus;
}
