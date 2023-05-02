import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class BetaTester {
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

  @Prop({
    default: null, required: true, trim: true, unique: true,
  })
  email: string;

  /***********
   * Methods *
   ***********/

  constructor(options?: Partial<BetaTester>) {
    // super();
    if (!options) {
      return;
    }
    Object.keys(options).forEach((key) => {
      this[key] = options[key];
    });
  }
}

export const BetaTesterSchema = SchemaFactory.createForClass(BetaTester);

export type BetaTesterDocument = HydratedDocument<BetaTester>;

BetaTesterSchema.index({
  email: 1,
});
