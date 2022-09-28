import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { EventCategoryUnusedFields } from './eventCategory.unused-fields';

@Schema({ timestamps: true })
export class EventCategory extends EventCategoryUnusedFields {
  /***********
   * Fields *
   ***********/

  readonly _id: mongoose.Schema.Types.ObjectId;

  @Prop()
  createdAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  @Prop()
  updatedAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  /***********
   * Methods *
   ***********/

  constructor(options?: Partial<EventCategory>) {
    super();
    if (!options) {
      return;
    }
    Object.keys(options).forEach((key) => {
      this[key] = options[key];
    });
  }
}

export const EventCategorySchema = SchemaFactory.createForClass(EventCategory);

export type EventCategoryDocument = EventCategory & Document;
