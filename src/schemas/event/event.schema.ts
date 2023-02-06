import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { EventCategory } from '../eventCategory/eventCategory.schema';
import { User } from '../user/user.schema';
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

  @Prop({ default: null, ref: User.name })
  userId: mongoose.Schema.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId, default: null, ref: EventCategory.name, required: true,
  })
  event_type: EventCategory;

  @Prop({ default: null })
  startDate: Date;

  @Prop({ default: null })
  endDate: Date;

  @Prop({ default: null })
  sortStartDate: string;

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

  // This is an array of FULL https URLs to images that have been uploaded as part of event suggestion.
  // Unfortunately, this is not consistent with how images are normally handled in other contexts
  // (those are usually an array of objects with a key that holds a relative image path).
  @Prop({ type: Array, default: [] })
  images: string[];

  // NEW FIELD
  @Prop({ default: null })
  address: string;

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
EventSchema.index(
  {
    deleted: 1, status: 1, _id: 1,
  },
);
EventSchema.index(
  {
    deleted: 1, status: 1, startDate: 1, endDate: 1, sortStartDate: 1,
  },
);
export type EventDocument = Event & Document;
