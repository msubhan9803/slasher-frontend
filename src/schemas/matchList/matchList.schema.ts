import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { MatchListUnusedFields } from './matchList.unused-fields';

@Schema({ timestamps: true })
// This represents a conversation object (which is linked to a many Messages)
export class MatchList extends MatchListUnusedFields {
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

  constructor(options?: Partial<MatchList>) {
    super();
    if (!options) {
      return;
    }
    Object.keys(options).forEach((key) => {
      this[key] = options[key];
    });
  }
}

export const MatchListSchema = SchemaFactory.createForClass(MatchList);

export type MatchListDocument = MatchList & Document;
