import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from '../user/user.schema';
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
