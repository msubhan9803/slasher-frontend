import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { EventActiveStatus } from './event.enums';
import { EventUnusedFields } from './event.unused-fields';

@Schema({ timestamps: true })
export class Event extends EventUnusedFields {
  /***********
   * Fields *
   ***********/

  readonly _id: mongoose.Schema.Types.ObjectId;

  @Prop()
  createdAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  @Prop()
  updatedAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  @Prop({ required: true })
  name: string;

  @Prop({ default: null, ref: 'users' })
  userId: mongoose.Schema.Types.ObjectId;

  @Prop({ default: null, ref: 'eventCategories', required: true })
  event_type: mongoose.Schema.Types.ObjectId;

  @Prop({ default: null })
  startDate: Date;

  @Prop({ default: null })
  endDate: Date;

  @Prop({ default: null })
  country: string;

  @Prop({ default: null })
  state: string;

  @Prop({ default: null })
  city: string;

  @Prop({ default: null })
  event_info: string;

  @Prop({ default: null })
  url: string;

  @Prop({ default: null })
  author: string;

  @Prop({
    enum: [
      EventActiveStatus.Inactive,
      EventActiveStatus.Active,
      EventActiveStatus.Deactivated,
    ],
    default: EventActiveStatus.Inactive,
  })
  status: EventActiveStatus;

  @Prop({ default: false })
  deleted: boolean;

  /***********
   * Methods *
   ***********/

  constructor(options?: Partial<Event>) {
    super();
    if (!options) {
      return;
    }
    Object.keys(options).forEach((key) => {
      this[key] = options[key];
    });
  }
}

export const EventSchema = SchemaFactory.createForClass(Event);

export type EventDocument = Event & Document;
