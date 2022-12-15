import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from '../user/user.schema';
import { NotificationDeletionStatus, NotificationStatus } from './notification.enums';
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

  @Prop({
    enum: [NotificationStatus.Inactive, NotificationStatus.Active],
    default: NotificationStatus.Inactive,
  })
  status: number;

  @Prop({
    enum: [
      NotificationDeletionStatus.NotDeleted,
      NotificationDeletionStatus.Deleted,
    ],
    default: NotificationDeletionStatus.NotDeleted,
  })
  is_deleted: number; // This should be a boolean value, but using number for old API compatibility. 0-false, 1-true

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

export type NotificationDocument = Notification & Document;
