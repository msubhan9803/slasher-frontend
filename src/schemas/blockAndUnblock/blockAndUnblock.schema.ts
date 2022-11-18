import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from '../user/user.schema';
import { BlockAndUnblockReaction } from './blockAndUnblock.enums';
import { BlockAndUnblockUnusedFields } from './blockAndUnblock.unused-fields';

@Schema({ timestamps: true })
export class BlockAndUnblock extends BlockAndUnblockUnusedFields {
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
      BlockAndUnblockReaction.Block,
      BlockAndUnblockReaction.Unblock,
    ],
  })
  reaction: BlockAndUnblockReaction;

  /***********
   * Methods *
   ***********/

  constructor(options?: Partial<BlockAndUnblock>) {
    super();
    if (!options) {
      return;
    }
    Object.keys(options).forEach((key) => {
      this[key] = options[key];
    });
  }
}

export const BlockAndUnblockSchema = SchemaFactory.createForClass(BlockAndUnblock);

// TODO: When relationId is removed, remove it from the index here too.
// TODO: When requestFrom is removed, remove it from the index here too.
// TODO: When reasonOfReport is removed, remove it from the index here too.
// TODO: When created is removed, remove it from the index here too.
BlockAndUnblockSchema.index(
  {
    to: 1, from: 1, reaction: 1, relationId: 1, requestFrom: 1, reasonOfReport: 1, created: 1,
  },
);

export type BlockAndUnblockDocument = BlockAndUnblock & Document;
