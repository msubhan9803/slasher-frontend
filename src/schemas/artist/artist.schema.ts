import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { ArtistUnusedFields } from './artist.unused-fields';

@Schema({ timestamps: true })
export class Artist extends ArtistUnusedFields {
  /***********
   * Fields *
   ***********/

  readonly _id: mongoose.Schema.Types.ObjectId;

  @Prop()
  createdAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  @Prop()
  updatedAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  @Prop({ default: null, required: true, trim: true })
  name: string;

  /***********
   * Methods *
   ***********/

  constructor(options?: Partial<Artist>) {
    super();
    if (!options) {
      return;
    }
    Object.keys(options).forEach((key) => {
      this[key] = options[key];
    });
  }
}

export const ArtistSchema = SchemaFactory.createForClass(Artist);

export type ArtistDocument = HydratedDocument<Artist>;

ArtistSchema.index({
  name: 1, descriptions: 1, logo: 1, type: 1, status: 1, createdBy: 1, deleted: 1,
});
