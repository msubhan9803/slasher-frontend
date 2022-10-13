import { Prop } from '@nestjs/mongoose';
import {
  UserSettingNotificationStatus,
} from './userSetting.enums';

export class UserSettingUnusedFields {
  // NOT USED
  @Prop({ enum: [UserSettingNotificationStatus.Off, UserSettingNotificationStatus.On], default: UserSettingNotificationStatus.On })
  event_suggested: UserSettingNotificationStatus;

  // NOT USED
  @Prop({ enum: [UserSettingNotificationStatus.Off, UserSettingNotificationStatus.On], default: UserSettingNotificationStatus.On })
  event_reminder: UserSettingNotificationStatus;

  // NOT USED
  @Prop({ enum: [UserSettingNotificationStatus.Off, UserSettingNotificationStatus.On], default: UserSettingNotificationStatus.On })
  movie_comment_on_reply: UserSettingNotificationStatus;

  // NOT USED
  @Prop({ enum: [UserSettingNotificationStatus.Off, UserSettingNotificationStatus.On], default: UserSettingNotificationStatus.On })
  movie_comment_reply_like: UserSettingNotificationStatus;

  // NOT USED
  @Prop({ enum: [UserSettingNotificationStatus.Off, UserSettingNotificationStatus.On], default: UserSettingNotificationStatus.On })
  movie_mention_on_comment_reply: UserSettingNotificationStatus;

  // NOT USED
  @Prop({ enum: [UserSettingNotificationStatus.Off, UserSettingNotificationStatus.On], default: UserSettingNotificationStatus.On })
  message_board_mention_on_comment_reply: UserSettingNotificationStatus;

  // NOT USED
  @Prop({ enum: [UserSettingNotificationStatus.Off, UserSettingNotificationStatus.On], default: UserSettingNotificationStatus.On })
  rss_feed_mention_on_post_comment_reply: UserSettingNotificationStatus;

  // NOT USED
  @Prop({ enum: [UserSettingNotificationStatus.Off, UserSettingNotificationStatus.On], default: UserSettingNotificationStatus.On })
  rss_feed_post_like: UserSettingNotificationStatus;

  // NOT USED
  @Prop({ enum: [UserSettingNotificationStatus.Off, UserSettingNotificationStatus.On], default: UserSettingNotificationStatus.On })
  app_tutorial: UserSettingNotificationStatus;
}
