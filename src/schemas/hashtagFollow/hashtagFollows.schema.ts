import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Hashtag } from '../hastag/hashtag.schema';
import { User } from '../user/user.schema';
import {
  HashTagsFollowNotificationsEnabled,
  HashTagsFollowStatus,
} from './hashtagFollows.enums';
import { HashTagsFollowUnusedFields } from './hashtagFollows.unused-fields';

@Schema({ timestamps: true })
export class HashTagsFollow extends HashTagsFollowUnusedFields {
  /***********
   * Fields *
   ***********/

  readonly _id: mongoose.Schema.Types.ObjectId;

  @Prop()
  createdAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  @Prop()
  updatedAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  @Prop({ default: null, ref: User.name, required: true })
  userId: mongoose.Schema.Types.ObjectId;

  @Prop({ default: null, ref: Hashtag.name, required: true })
  hashTagId: mongoose.Schema.Types.ObjectId;

  @Prop({
    enum: [HashTagsFollowNotificationsEnabled.NotEnabled, HashTagsFollowNotificationsEnabled.Enabled],
    default: HashTagsFollowNotificationsEnabled.NotEnabled,
  })
  notification: HashTagsFollowNotificationsEnabled;

  @Prop({
    enum: [HashTagsFollowStatus.Inactive, HashTagsFollowStatus.Active, HashTagsFollowStatus.Deactivated],
    default: HashTagsFollowStatus.Active,
  })
  status: HashTagsFollowStatus;

  /***********
   * Methods *
   ***********/

  constructor(options?: Partial<HashTagsFollow>) {
    super();
    if (!options) {
      return;
    }
    Object.keys(options).forEach((key) => {
      this[key] = options[key];
    });
  }
}

export const HashTagsFollowSchema = SchemaFactory.createForClass(HashTagsFollow);

HashTagsFollowSchema.index(
  {
    userId: 1,
  },
);
HashTagsFollowSchema.index(
  {
    userId: 1, hashTagId: 1,
  },
);

export type HashTagsFollowDocument = HydratedDocument<HashTagsFollow>;
