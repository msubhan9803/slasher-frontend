import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { RssFeedProviderUnusedFields } from './rssFeedProvider.unused-fields';

@Schema({ timestamps: true })
export class RssFeedProvider extends RssFeedProviderUnusedFields {
  /***********
   * Fields *
   ***********/

  readonly _id: mongoose.Schema.Types.ObjectId;

  @Prop()
  createdAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  @Prop()
  updatedAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  // NOT USED
  @Prop({ default: null, required: true })
  title: string;

  // NOT USED
  @Prop({ default: null })
  sortTitle: string;

  /***********
   * Methods *
   ***********/

  constructor(options?: Partial<RssFeedProvider>) {
    super();
    if (!options) {
      return;
    }
    Object.keys(options).forEach((key) => {
      this[key] = options[key];
    });
  }
}

export const RssFeedProviderSchema = SchemaFactory.createForClass(RssFeedProvider);

export type RssFeedProviderDocument = RssFeedProvider & Document;
