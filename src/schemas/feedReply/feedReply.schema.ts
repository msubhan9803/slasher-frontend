import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Image, ImageSchema } from '../shared/image.schema';
import { FeedReplyDeletionState } from './feedReply.enums';
import { FeedReplyUnusedFields } from './feedReply.unused-fields';

// Note: {collection: 'feedreplays'} below is deliberate.  Unfortunately, the old API app had a typo
// in the collection name, so we need to preserve that typo until the old API is updated or retired.
@Schema({ timestamps: true, collection: 'feedreplays' })
export class FeedReply extends FeedReplyUnusedFields {
  /***********
   * Fields *
   ***********/

  readonly _id: mongoose.Schema.Types.ObjectId;

  @Prop({ default: null, ref: 'feedComments' })
  feedCommentId: mongoose.Schema.Types.ObjectId;

  @Prop({ default: null, ref: 'users', required: true })
  userId: mongoose.Schema.Types.ObjectId;

  @Prop({ default: null, required: true })
  message: string;

  @Prop({ type: [ImageSchema] })
  images: Image[];

  @Prop({
    required: true,
    enum: [
      FeedReplyDeletionState.NotDeleted,
      FeedReplyDeletionState.Deleted,
    ],
    default: FeedReplyDeletionState.NotDeleted,
  })
  deleted: FeedReplyDeletionState;

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
