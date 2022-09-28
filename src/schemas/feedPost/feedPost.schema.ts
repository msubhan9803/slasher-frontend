import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Image, ImageSchema } from '../shared/image.schema';
import { FeedPostUnusedFields } from './feedPost.unused-fields';

@Schema({ timestamps: true })
export class FeedPost extends FeedPostUnusedFields {
  /***********
   * Fields *
   ***********/

  readonly _id: mongoose.Schema.Types.ObjectId;

  @Prop()
  createdAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  @Prop()
  updatedAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  @Prop({ default: null, ref: 'users', required: true })
  userId: mongoose.Schema.Types.ObjectId;

  @Prop({ default: null })
  message: string;

  @Prop({ type: [ImageSchema] })
  images: Image[];

  /***********
   * Methods *
   ***********/

  constructor(options?: Partial<FeedPost>) {
    super();
    if (!options) {
      return;
    }
    Object.keys(options).forEach((key) => {
      this[key] = options[key];
    });
  }
}

export const FeedPostSchema = SchemaFactory.createForClass(FeedPost);

export type FeedPostDocument = FeedPost & Document;
