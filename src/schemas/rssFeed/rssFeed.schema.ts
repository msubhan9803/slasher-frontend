import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
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

  @Prop({ default: null, ref: 'rssFeedProvider', required: true })
  rssfeedProviderId: mongoose.Schema.Types.ObjectId;

  @Prop({ default: null, required: true, trim: true })
  title: string;

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

export type RssFeedDocument = RssFeed & Document;
