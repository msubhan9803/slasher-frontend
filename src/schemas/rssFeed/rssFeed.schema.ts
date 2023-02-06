import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { RssFeedProvider } from '../rssFeedProvider/rssFeedProvider.schema';
import { RssFeedDeletionStatus } from './rssFeed.enums';
import { RssFeedUnusedFields } from './rssFeed.unused-fields';

@Schema({ timestamps: true })
export class RssFeed extends RssFeedUnusedFields {
  /***********
   * Fields *
   ***********/

  readonly _id: mongoose.Schema.Types.ObjectId;

  @Prop()
  createdAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  @Prop()
  updatedAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  @Prop({ default: null, ref: RssFeedProvider.name, required: true })
  rssfeedProviderId: mongoose.Schema.Types.ObjectId;

  @Prop({ default: null, required: true, trim: true })
  title: string;

  @Prop({
    enum: [
      RssFeedDeletionStatus.NotDeleted,
      RssFeedDeletionStatus.Deleted,
    ],
    default: RssFeedDeletionStatus.NotDeleted,
  })
  deleted: RssFeedDeletionStatus;

  /***********
   * Methods *
   ***********/

  constructor(options?: Partial<RssFeed>) {
    super();
    if (!options) {
      return;
    }
    Object.keys(options).forEach((key) => {
      this[key] = options[key];
    });
  }
}

export const RssFeedSchema = SchemaFactory.createForClass(RssFeed);
RssFeedSchema.index(
  {
    _id: 1, deleted: 1,
  },
);
export type RssFeedDocument = RssFeed & Document;
