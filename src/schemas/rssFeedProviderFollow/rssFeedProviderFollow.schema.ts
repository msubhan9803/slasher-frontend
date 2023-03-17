import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { RssFeedProvider } from '../rssFeedProvider/rssFeedProvider.schema';
import { User } from '../user/user.schema';
import {
  RssFeedProviderFollowNotificationsEnabled,
  RssFeedProviderFollowStatus,
} from './rssFeedProviderFollow.enums';
import { RssFeedProviderFollowUnusedFields } from './rssFeedProviderFollow.unused-fields';

@Schema({ timestamps: true })
export class RssFeedProviderFollow extends RssFeedProviderFollowUnusedFields {
  /***********
   * Fields *
   ***********/

  readonly _id: mongoose.Schema.Types.ObjectId;

  @Prop()
  createdAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  @Prop()
  updatedAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  @Prop({ default: null, ref: RssFeedProvider.name, required: true })
  rssfeedProviderId: mongoose.Schema.Types.ObjectId;

  @Prop({ default: null, ref: User.name, required: true })
  userId: mongoose.Schema.Types.ObjectId;

  @Prop({
    enum: [RssFeedProviderFollowNotificationsEnabled.NotEnabled, RssFeedProviderFollowNotificationsEnabled.Enabled],
    default: RssFeedProviderFollowNotificationsEnabled.Enabled,
  })
  notification: RssFeedProviderFollowNotificationsEnabled;

  @Prop({
    enum: [RssFeedProviderFollowStatus.Inactive, RssFeedProviderFollowStatus.Active, RssFeedProviderFollowStatus.Deactivated],
    default: RssFeedProviderFollowStatus.Active,
  })
  status: RssFeedProviderFollowStatus;

  /***********
   * Methods *
   ***********/

  constructor(options?: Partial<RssFeedProviderFollow>) {
    super();
    if (!options) {
      return;
    }
    Object.keys(options).forEach((key) => {
      this[key] = options[key];
    });
  }
}

export const RssFeedProviderFollowSchema = SchemaFactory.createForClass(RssFeedProviderFollow);
RssFeedProviderFollowSchema.index(
  {
    userId: 1,
  },
);
RssFeedProviderFollowSchema.index(
  {
    userId: 1, rssfeedProviderId: 1,
  },
);

export type RssFeedProviderFollowDocument = HydratedDocument<RssFeedProviderFollow>;
