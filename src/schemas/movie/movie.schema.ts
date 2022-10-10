import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { MovieUnusedFields } from './movie.unused-fields';

@Schema({ timestamps: true })
export class Movie extends MovieUnusedFields {
  /***********
   * Fields *
   ***********/

  readonly _id: mongoose.Schema.Types.ObjectId;

  @Prop()
  createdAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  @Prop()
  updatedAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  @Prop({ default: null, trim: true })
  name: string;

  @Prop({ default: null, trim: true })
  sort_name: string;

  @Prop({ default: null, trim: true })
  sortReleaseDate: string;

  @Prop({ type: Array, default: null, trim: true })
  trailerUrls: string[];

  @Prop({ default: null, trim: true })
  countryOfOrigin: string;

  @Prop({ default: null, trim: true })
  durationInMinutes: number;

  @Prop({ default: null, trim: true })
  contentRating: string;

  /***********
   * Methods *
   ***********/

  constructor(options?: Partial<Movie>) {
    super();
    if (!options) {
      return;
    }
    Object.keys(options).forEach((key) => {
      this[key] = options[key];
    });
  }
}

export const MovieSchema = SchemaFactory.createForClass(Movie);

export type MovieDocument = Movie & Document;
