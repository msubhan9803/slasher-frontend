import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Image, ImageSchema } from '../shared/image.schema';
import { FeedCommentDeletionState } from './feedComment.enums';
import { FeedCommentUnusedFields } from './feedComment.unused-fields';

@Schema({ timestamps: true })
export class FeedComment extends FeedCommentUnusedFields {
  /***********
   * Fields *
   ***********/

  readonly _id: mongoose.Schema.Types.ObjectId;

  @Prop({ default: null, ref: 'feedPosts', required: true })
  feedPostId: mongoose.Schema.Types.ObjectId;

  @Prop({ default: null, ref: 'users', required: true })
  userId: mongoose.Schema.Types.ObjectId;

  @Prop({ default: null, required: true })
  message: string;

  @Prop({ type: [ImageSchema] })
  images: Image[];

  @Prop({
    required: true,
    enum: [
      FeedCommentDeletionState.NotDeleted,
      FeedCommentDeletionState.Deleted,
    ],
    default: FeedCommentDeletionState.NotDeleted,
  })
  is_deleted: FeedCommentDeletionState;

  @Prop()
  createdAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  @Prop()
  updatedAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  /***********
   * Methods *
   ***********/

  constructor(options?: Partial<FeedComment>) {
    super();
    if (!options) {
      return;
    }
    Object.keys(options).forEach((key) => {
      this[key] = options[key];
    });
  }
}

export const FeedCommentSchema = SchemaFactory.createForClass(FeedComment);

export type FeedCommentDocument = FeedComment & Document;
