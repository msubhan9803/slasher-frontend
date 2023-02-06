import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from '../user/user.schema';
import { SuggestBlockReaction } from './suggestBlock.enums';
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

  // The user who initiates the block
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, required: true })
  from: User;

  // The user who will BE blocked
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, required: true })
  to: User;

  @Prop({
    enum: [
      SuggestBlockReaction.Block,
      SuggestBlockReaction.Unblock,
    ],
  })
  reaction: SuggestBlockReaction;

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

SuggestBlockSchema.index(
  {
    from: 1, reaction: 1,
  },
);

export type SuggestBlockDocument = SuggestBlock & Document;
