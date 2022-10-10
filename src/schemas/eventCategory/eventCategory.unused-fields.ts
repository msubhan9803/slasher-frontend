import { Prop } from '@nestjs/mongoose';
import { EventCategoryDeletionState, EventCategoryStatus } from './eventCategory.enums';

export class EventCategoryUnusedFields {
  // NOT USED
  @Prop({ required: true, unique: true })
  event_name: string;

  // NOT USED
  @Prop({ default: null })
  event_colour: string;

  @Prop({
    enum: [EventCategoryStatus.Inactive, EventCategoryStatus.Active],
    default: EventCategoryStatus.Active,
  })
  status: EventCategoryStatus;

  // NOT USED
  @Prop({
    required: true,
    enum: [
      EventCategoryDeletionState.NotDeleted,
      EventCategoryDeletionState.Deleted,
    ],
    default: EventCategoryDeletionState.NotDeleted,
  })
  is_deleted: EventCategoryDeletionState;
}
