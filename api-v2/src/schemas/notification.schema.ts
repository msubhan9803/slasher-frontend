import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import mongoose from 'mongoose';

export enum NotificationType {
  Match = 1,
  MessageBoard = 2,
  ViewProfile = 3,
  Message = 4,
  Type5 = 5, // placeholder, for old API compatibility
  Type6 = 6, // placeholder, for old API compatibility
  Type7 = 7, // placeholder, for old API compatibility
  Type8 = 8, // placeholder, for old API compatibility
  Type9 = 9, // placeholder, for old API compatibility
  Type10 = 10, // placeholder, for old API compatibility
  Type11 = 11, // placeholder, for old API compatibility
  Type12 = 12, // placeholder, for old API compatibility
  Type13 = 13, // placeholder, for old API compatibility
  Type14 = 14, // placeholder, for old API compatibility
  Type15 = 15, // placeholder, for old API compatibility
}

export enum NotificationStatus {
  Inactive = 0,
  Active = 1,
}

@Schema({ timestamps: true })
export class Notification {
  readonly _id: mongoose.Schema.Types.ObjectId;

  @Prop()
  createdAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  @Prop()
  updatedAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  @Prop({ required: true })
  userId: mongoose.Schema.Types.ObjectId; // receiver id

  @Prop({ required: true, default: null, trim: true })
  notificationMsg: string;

  // NOT USED
  @Prop({ required: true, trim: true, default: 'Push' })
  notificationFor: string;

  // NOT USED
  @Prop({
    required: true,
    enum: [
      NotificationType.Match,
      NotificationType.MessageBoard,
      NotificationType.ViewProfile,
      NotificationType.Message,
      // NOTE: Not adding other types because they're just placeholders
    ],
    default: NotificationType.Match,
  })
  notifyType: NotificationType;

  // NOT USED
  @Prop({ type: Object, default: null })
  data: object;

  // NOT USED
  @Prop({ default: null })
  images: string[];

  // NOT USED
  @Prop({ default: '5c9c60ca59bf9617c18f6cec', ref: 'users' })
  senderId: mongoose.Schema.Types.ObjectId;

  // NOT USED
  @Prop({ type: Array, default: [] })
  allUsers: { type: string[] };

  // NOT USED
  @Prop({ default: null, ref: 'feedPosts' })
  feedPostId: mongoose.Schema.Types.ObjectId;

  // NOT USED
  @Prop({ default: null, ref: 'feedComments' })
  feedCommentId: mongoose.Schema.Types.ObjectId;

  // NOT USED
  @Prop({ default: null, ref: 'feedreplays' })
  feedReplyId: mongoose.Schema.Types.ObjectId;

  // NOT USED
  @Prop({ default: null, ref: 'movies' })
  movieId: mongoose.Schema.Types.ObjectId;

  // NOT USED
  @Prop({ default: null })
  movieDBId: number;

  // NOT USED
  @Prop({ enum: [0, 1], default: 0 })
  isRead: number; // This should be a boolean value, but using number for old API compatibility. 0-false, 1-true

  // NOT USED
  @Prop({
    enum: [NotificationStatus.Inactive, NotificationStatus.Active],
    default: NotificationStatus.Inactive,
  })
  status: number;

  // NOT USED
  @Prop({ enum: [0, 1], default: 0 })
  is_deleted: number; // This should be a boolean value, but using number for old API compatibility. 0-false, 1-true

  // NOT USED
  @Prop({ default: Date.now })
  lastUpdateAt: Date;

  // NOT USED
  @Prop({ default: null, ref: 'movieComments' })
  movieMainCommentID: mongoose.Schema.Types.ObjectId;

  // NOT USED
  @Prop({ default: null, ref: 'messagePosts' })
  messageMainPostID: mongoose.Schema.Types.ObjectId;

  // NOT USED
  @Prop({ default: null, ref: 'movieReplays' })
  movieReplyID: mongoose.Schema.Types.ObjectId;

  // NOT USED
  @Prop({ default: null, ref: 'messageComments' })
  messageCommentID: mongoose.Schema.Types.ObjectId;

  // NOT USED
  @Prop({ default: null, ref: 'rssFeedProvider' })
  rssFeedProviderId: mongoose.Schema.Types.ObjectId;

  // NOT USED
  @Prop({ default: null, ref: 'rssFeed' })
  rssFeedId: mongoose.Schema.Types.ObjectId;

  // NOT USED
  @Prop({ default: null, ref: 'rssFeedComments' })
  rssFeedCommentId: mongoose.Schema.Types.ObjectId;

  /***********
   * Methods *
   ***********/

  constructor(options?: Partial<Notification>) {
    if (!options) {
      return;
    }
    Object.keys(options).forEach((key) => {
      this[key] = options[key];
    });
  }
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

export type NotificationDocument = Notification & Document;
