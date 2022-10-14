import { Prop } from '@nestjs/mongoose';

export class EventCategoryUnusedFields {
  // NOT USED
  @Prop({ default: null })
  event_colour: string;
}
