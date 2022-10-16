import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { ReportUserSchema, ReportUser } from '../shared/reportUser.schema';
import { RssFeedProviderAutoFollow } from './rssFeedProvider.enums';

export class RssFeedProviderUnusedFields {
  // NOT USED
  @Prop({ default: null })
  logo: string;

  // NOT USED
  @Prop({ default: null })
  feed_url: string;

  // NOT USED
  @Prop({ default: RssFeedProviderAutoFollow.No })
  auto_follow: RssFeedProviderAutoFollow;

  // NOT USED
  @Prop({ default: 0 })
  preview_count: number;

  @Prop({ default: 0 })
  follower_count: number;

  @Prop({ default: null })
  description: string;

  // NOT USED
  @Prop({ default: null, ref: 'users' })
  createdBy: mongoose.Schema.Types.ObjectId;

  // NOT USED
  @Prop({ type: [ReportUserSchema] })
  reportUsers: ReportUser[];

  // NOT USED
  // This might be an array of ObjectIds of the users. Not 100% clear, since all records in prod
  // db currently hold an empty array.
  @Prop({ type: Array, default: [] })
  hideUsers: mongoose.Schema.Types.ObjectId[];

  // NOT USED
  // This might be an array of ObjectIds of the users. Not 100% clear, since all records in prod
  // db currently hold an empty array.
  @Prop({ type: Array, default: [] })
  shareUsers: mongoose.Schema.Types.ObjectId[];
}
