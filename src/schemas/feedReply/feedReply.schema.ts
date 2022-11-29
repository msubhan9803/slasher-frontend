import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { FeedReplyUnusedFields } from './feedReply.unused-fields';

// Note: {collection: 'feedreplays'} below is deliberate.  Unfortunately, the old API app had a typo
// in the collection name, so we need to preserve that typo until the old API is updated or retired.
@Schema({ timestamps: true, collection: 'feedreplays' })
export class FeedReply extends FeedReplyUnusedFields {
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

  constructor(options?: Partial<FeedReply>) {
    super();
    if (!options) {
      return;
    }
    Object.keys(options).forEach((key) => {
      this[key] = options[key];
    });
  }
}

export const FeedReplySchema = SchemaFactory.createForClass(FeedReply);

export type FeedReplyDocument = FeedReply & Document;
