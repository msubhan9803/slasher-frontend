import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from '../user/user.schema';
import { NotificationDeletionStatus, NotificationReadStatus } from './notification.enums';
import { NotificationUnusedFields } from './notification.unused-fields';

@Schema({ timestamps: true })
export class Notification extends NotificationUnusedFields {
  /***********
   * Fields *
   ***********/

  readonly _id: mongoose.Schema.Types.ObjectId;

  @Prop()
  createdAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  @Prop()
  updatedAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, required: true })
  userId: User; // receiver id

  @Prop({ required: true, default: null, trim: true })
  notificationMsg: string;

  // This is a new field in the new API app.  It does not exist in the old API app.
  // This field indicates whether or not a notification has been "processed".  "Processing" of a
  // notification involves:
  // 1. Looking at the notification and determining whether it should be emitted via socket
  //    (or deleted, if the recipient does not subscribe to the particular notification type ).
  // 2. (Later) Sending the notification as a push notification.
  @Prop({ default: false })
  isProcessed: boolean;

  @Prop({
    enum: [
      NotificationDeletionStatus.NotDeleted,
      NotificationDeletionStatus.Deleted,
    ],
    default: NotificationDeletionStatus.NotDeleted,
  })
  is_deleted: number; // This should be a boolean value, but using number for old API compatibility. 0-false, 1-true

  @Prop({
    enum: [NotificationReadStatus.Unread, NotificationReadStatus.Read],
    default: NotificationReadStatus.Unread,
  })
  isRead: number;

  /***********
   * Methods *
   ***********/

  constructor(options?: Partial<Notification>) {
    super();
    if (!options) {
      return;
    }
    Object.keys(options).forEach((key) => {
      this[key] = options[key];
    });
  }
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
NotificationSchema.index(
  {
    userId: 1, is_deleted: 1,
  },
);
NotificationSchema.index(
  {
    userId: 1, is_deleted: 1, isRead: 1,
  },
);
NotificationSchema.index(
  {
    createdAt: 1,
  },
);
export type NotificationDocument = Notification & Document;

// Make sure that we have an index to support NotificationService#cleanupNotifications
NotificationSchema.index({ createdAt: 1 });
