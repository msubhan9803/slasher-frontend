import {
  IsOptional, IsIn, IsBoolean,
} from 'class-validator';
import { UserSettingNotificationStatus } from '../../schemas/userSetting/userSetting.enums';

export class UpdateNoticationSettingDto {
  @IsOptional()
  @IsBoolean()
  onboarding_completed: boolean;

  @IsIn([UserSettingNotificationStatus.Off, UserSettingNotificationStatus.On])
  @IsOptional()
  dating_got_a_match: UserSettingNotificationStatus;

  @IsIn([UserSettingNotificationStatus.Off, UserSettingNotificationStatus.On])
  @IsOptional()
  dating_message_received: UserSettingNotificationStatus;

  @IsIn([UserSettingNotificationStatus.Off, UserSettingNotificationStatus.On])
  @IsOptional()
  friends_got_a_match: UserSettingNotificationStatus;

  @IsIn([UserSettingNotificationStatus.Off, UserSettingNotificationStatus.On])
  @IsOptional()
  friends_message_received: UserSettingNotificationStatus;

  @IsIn([UserSettingNotificationStatus.Off, UserSettingNotificationStatus.On])
  @IsOptional()
  message_board_like_your_post: UserSettingNotificationStatus;

  @IsIn([UserSettingNotificationStatus.Off, UserSettingNotificationStatus.On])
  @IsOptional()
  message_board_reply_your_post: UserSettingNotificationStatus;

  @IsIn([UserSettingNotificationStatus.Off, UserSettingNotificationStatus.On])
  @IsOptional()
  message_board_new_post_on_thread: UserSettingNotificationStatus;

  @IsIn([UserSettingNotificationStatus.Off, UserSettingNotificationStatus.On])
  @IsOptional()
  feed_mention_on_post_comment_reply: UserSettingNotificationStatus;

  @IsIn([UserSettingNotificationStatus.Off, UserSettingNotificationStatus.On])
  @IsOptional()
  feed_post_like: UserSettingNotificationStatus;

  @IsIn([UserSettingNotificationStatus.Off, UserSettingNotificationStatus.On])
  @IsOptional()
  feed_comment_on_post: UserSettingNotificationStatus;
}
