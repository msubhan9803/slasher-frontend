import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { MusicUnusedFields } from './music.unused-fields';

@Schema({ timestamps: true })
export class Music extends MusicUnusedFields {
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

  constructor(options?: Partial<Music>) {
    super();
    if (!options) {
      return;
    }
    Object.keys(options).forEach((key) => {
      this[key] = options[key];
    });
  }
}

export const MusicSchema = SchemaFactory.createForClass(Music);

export type MusicDocument = Music & Document;
