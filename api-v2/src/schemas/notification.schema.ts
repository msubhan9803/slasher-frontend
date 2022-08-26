import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import mongoose from 'mongoose';

@Schema({ timestamps: true })
export class Notification {
  readonly _id: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  userId: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  notificationMsg: string;

  @Prop()
  createdAt: Date; // this is the date when the notification was created

  @Prop()
  updatedAt: Date; // this value should be updated when a notification is read (or modified in any other way)

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
