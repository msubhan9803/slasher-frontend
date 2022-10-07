import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { ReportUserSchema, ReportUser } from '../shared/reportUser.schema';
import { RssFeedDeletionStatus } from './rssFeed.enums';

export class RssFeedUnusedFields {
  // NOT USED
  @Prop({ default: null })
  link: string;

  // NOT USED
  @Prop({ default: null })
  ogImage: string;

  // NOT USED
  @Prop({ default: null })
  author: string;

  // NOT USED
  // Note: Based on old API code and prod database data, it seems like this may not be a controlled
  // set of values. For now, we'll assume unvalidated array of strings.
  @Prop({ type: Array, default: [] })
  category: string[];

  // NOT USED
  // Note: Based on old API code and prod database data, the structure of this data can vary widely,
  // so we'll make it type object[] for now.  Not ideal, but we don't want to break the old API
  // while it remains active.
  // Couple of example values:
  // {
  //   type: "video/mp4", length: "2065120",
  //   url: "https://horroroasis.com/wp-content/uploads/2021/07/S1E8_-Tika-Zika-Made-by-Headliner-1.mp4"
  // }
  // {
  //   width: "72"
  //   height: "72"
  //   url: "https://1.bp.blogspot.com/-IRZnPJi4qdA/YDQVsoIoO-I/AAAAAAAAGmY/m00a_UE..."
  //   "xmlns:media": "http://search.yahoo.com/mrss/"
  // }
  @Prop({ type: Array, default: [] })
  enclosures: object[];

  // NOT USED
  @Prop({ default: null })
  guid_t: string;

  // NOT USED
  @Prop({ default: 0 })
  pub_date: number;

  // NOT USED
  @Prop({ default: null })
  description: string;

  // NOT USED
  @Prop({ default: null })
  content: string;

  // NOT USED
  @Prop({ default: null })
  videid: string;

  // NOT USED
  @Prop({ default: null })
  content_encoded: string;

  // NOT USED
  @Prop({ default: 0 })
  preview_count: number;

  // NOT USED
  @Prop({ default: 0 })
  feedLikes: number;

  // NOT USED
  @Prop({
    enum: [
      RssFeedDeletionStatus.NotDeleted,
      RssFeedDeletionStatus.Deleted,
    ],
    default: RssFeedDeletionStatus.NotDeleted,
  })
  deleted: RssFeedDeletionStatus;

  // NOT USED
  @Prop({ default: null, ref: 'users' })
  createdBy: mongoose.Schema.Types.ObjectId;

  // NOT USED
  // Note: This appears to hold an empty array 100% of the time in the db.  We might be able to get
  // rid of this field later.
  @Prop({ default: [] })
  likes: mongoose.Schema.Types.ObjectId[];

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
