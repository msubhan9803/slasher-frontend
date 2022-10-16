import { Prop } from '@nestjs/mongoose';

export class EventUnusedFields {
  // NOT USED
  // This is an array of string usr ids (NOT actual ObjectIds) of the users who are are interested
  // in the event (i.e. tapped the heart icon on the event).
  @Prop({ type: Array, default: [] })
  interests: string[];

  // NOT USED
  @Prop({ default: 0 })
  rating: number;

  // NOT USED
  // Note: In the current database data, no Events actually have any comments stored.
  // We have an empty array for every Event record in the DB. Also, there is no current feature
  // in the app for adding comments to events, so we will probably remove this field later when the
  // old API app is retired.
  @Prop({ type: Array, default: [] })
  comments: string[];
}
