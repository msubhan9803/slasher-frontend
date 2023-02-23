import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { UserSettingNotificationStatus } from './userSetting.enums';
import { UserSettingUnusedFields } from './userSetting.unused-fields';

@Schema({ timestamps: true })
export class UserSetting extends UserSettingUnusedFields {
  /***********
   * Fields *
   ***********/

  readonly _id: mongoose.Schema.Types.ObjectId;

  @Prop()
  createdAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  @Prop()
  updatedAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  @Prop({ default: null, ref: 'users', required: true })
  userId: mongoose.Schema.Types.ObjectId;

  @Prop({ default: false })
  onboarding_completed: boolean;

  /*********************************
   * Notification settings: Dating *
   *********************************/

  // Notification for --- Like or match received
  @Prop({ enum: [UserSettingNotificationStatus.Off, UserSettingNotificationStatus.On], default: UserSettingNotificationStatus.On })
  dating_got_a_match: UserSettingNotificationStatus;

  // Notification for --- Dating message received
  @Prop({ enum: [UserSettingNotificationStatus.Off, UserSettingNotificationStatus.On], default: UserSettingNotificationStatus.On })
  dating_message_received: UserSettingNotificationStatus;

  /**********************************
   * Notification settings: Friends *
   **********************************/

  // Notification for --- Friend request
  @Prop({ enum: [UserSettingNotificationStatus.Off, UserSettingNotificationStatus.On], default: UserSettingNotificationStatus.On })
  friends_got_a_match: UserSettingNotificationStatus;

  // Notification for --- Regular (non-dating) message received
  @Prop({ enum: [UserSettingNotificationStatus.Off, UserSettingNotificationStatus.On], default: UserSettingNotificationStatus.On })
  friends_message_received: UserSettingNotificationStatus;

  /*****************************************
   * Notification settings: Slasher Groups *
   *****************************************/

  // Notification for --- Like on your post/comment/reply
  @Prop({ enum: [UserSettingNotificationStatus.Off, UserSettingNotificationStatus.On], default: UserSettingNotificationStatus.On })
  message_board_like_your_post: UserSettingNotificationStatus;

  // Notification for --- Comment/reply to your post
  @Prop({ enum: [UserSettingNotificationStatus.Off, UserSettingNotificationStatus.On], default: UserSettingNotificationStatus.On })
  message_board_reply_your_post: UserSettingNotificationStatus;

  // Notification for --- New post in thread
  @Prop({ enum: [UserSettingNotificationStatus.Off, UserSettingNotificationStatus.On], default: UserSettingNotificationStatus.On })
  message_board_new_post_on_thread: UserSettingNotificationStatus;

  /***********************************
   * Notification settings: Mentions *
   ***********************************/

  // Notification for --- Mention on post/comment/reply
  @Prop({ enum: [UserSettingNotificationStatus.Off, UserSettingNotificationStatus.On], default: UserSettingNotificationStatus.On })
  feed_mention_on_post_comment_reply: UserSettingNotificationStatus;

  /***********************************
   * Notification settings: Mentions *
   ***********************************/

  // Notification for --- Like on your post/comment/reply
  @Prop({ enum: [UserSettingNotificationStatus.Off, UserSettingNotificationStatus.On], default: UserSettingNotificationStatus.On })
  feed_post_like: UserSettingNotificationStatus;

  // Notification for --- Comment/reply on your post
  @Prop({ enum: [UserSettingNotificationStatus.Off, UserSettingNotificationStatus.On], default: UserSettingNotificationStatus.On })
  feed_comment_on_post: UserSettingNotificationStatus;

  /***********
   * Methods *
   ***********/

  constructor(options?: Partial<UserSetting>) {
    super();
    if (!options) {
      return;
    }
    Object.keys(options).forEach((key) => {
      this[key] = options[key];
    });
  }
}

export const UserSettingSchema = SchemaFactory.createForClass(UserSetting);

export type UserSettingDocument = HydratedDocument<UserSetting>;
