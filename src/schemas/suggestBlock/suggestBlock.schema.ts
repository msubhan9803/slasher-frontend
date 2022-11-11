import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from '../user/user.schema';
import { SuggestReaction } from './suggestBlock.enums';
import { SuggestBlockUnusedFields } from './suggestBlock.unused-fields';

@Schema({ timestamps: true })
export class SuggestBlock extends SuggestBlockUnusedFields {
  /***********
   * Fields *
   ***********/

  readonly _id: mongoose.Schema.Types.ObjectId;

  @Prop()
  createdAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  @Prop()
  updatedAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, required: true })
  from: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, required: true })
  to: User;

  @Prop({
    enum: [
      SuggestReaction.Block,
      SuggestReaction.Unblock,
    ],
  })
  reaction: SuggestReaction;

  /***********
   * Methods *
   ***********/

  constructor(options?: Partial<SuggestBlock>) {
    super();
    if (!options) {
      return;
    }
    Object.keys(options).forEach((key) => {
      this[key] = options[key];
    });
  }
}

export const SuggestBlockSchema = SchemaFactory.createForClass(SuggestBlock);

// TODO: When reasonOfReport it removed, remove it from the index here too
SuggestBlockSchema.index(
  {
    to: 1, from: 1, reaction: 1, reasonOfReport: 1,
  },
);

export type SuggestBlockDocument = SuggestBlock & Document;
