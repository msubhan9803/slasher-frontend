import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
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

  @Prop({ required: true })
  userId: mongoose.Schema.Types.ObjectId; // receiver id

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
