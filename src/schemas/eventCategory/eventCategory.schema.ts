import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { EventCategoryDeletionState, EventCategoryStatus } from './eventCategory.enums';
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

  @Prop({ required: true, unique: true })
  event_name: string;

  @Prop({
    enum: [EventCategoryStatus.Inactive, EventCategoryStatus.Active],
    default: EventCategoryStatus.Active,
  })
  status: EventCategoryStatus;

  @Prop({
    required: true,
    enum: [
      EventCategoryDeletionState.NotDeleted,
      EventCategoryDeletionState.Deleted,
    ],
    default: EventCategoryDeletionState.NotDeleted,
  })
  is_deleted: EventCategoryDeletionState;

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
EventCategorySchema.index(
  {
    is_deleted: 1, status: 1, _id: 1,
  },
);
export type EventCategoryDocument = EventCategory & Document;
