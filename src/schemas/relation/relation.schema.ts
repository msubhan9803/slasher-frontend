import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { RelationUnusedFields } from './relation.unused-fields';

@Schema({ timestamps: true })
export class Relation extends RelationUnusedFields {
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

  constructor(options?: Partial<Relation>) {
    super();
    if (!options) {
      return;
    }
    Object.keys(options).forEach((key) => {
      this[key] = options[key];
    });
  }
}

export const RelationSchema = SchemaFactory.createForClass(Relation);

export type RelationDocument = HydratedDocument<Relation>;
