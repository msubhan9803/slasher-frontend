import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { MovieReplyUnusedFields } from './movieReply.unused-fields';

// Note: {collection: 'moviereplays'} below is deliberate.  Unfortunately, the old API app had a typo
// in the collection name, so we need to preserve that typo until the old API is updated or retired.
@Schema({ timestamps: true, collection: 'moviereplays' })
export class MovieReply extends MovieReplyUnusedFields {
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

  constructor(options?: Partial<MovieReply>) {
    super();
    if (!options) {
      return;
    }
    Object.keys(options).forEach((key) => {
      this[key] = options[key];
    });
  }
}

export const MovieReplySchema = SchemaFactory.createForClass(MovieReply);

export type MovieReplyDocument =  HydratedDocument<MovieReply>;
