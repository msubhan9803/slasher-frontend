import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { FeedCommentUnusedFields } from './feedComment.unused-fields';

// TODO: Might need to add {collection: 'feedcomments'} below if auto-inflection doesn't match old API
@Schema({ timestamps: true })
export class FeedComment extends FeedCommentUnusedFields {
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
