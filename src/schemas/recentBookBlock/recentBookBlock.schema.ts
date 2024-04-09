import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../user/user.schema';
import { RecentBookBlockReaction } from './recentBookBlock.enums';
import { RecentBookBlockUnusedFields } from './recentBookBlock.unused-fields';
import { Book } from '../Book/Book.schema';

@Schema({ timestamps: true })
export class RecentBookBlock extends RecentBookBlockUnusedFields {
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
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Book.name, required: true })
  bookId: Book;

  @Prop({
    enum: [
      RecentBookBlockReaction.Block,
      RecentBookBlockReaction.Unblock,
    ],
  })
  reaction: RecentBookBlockReaction;

  /***********
   * Methods *
   ***********/

  constructor(options?: Partial<RecentBookBlock>) {
    super();
    if (!options) {
      return;
    }
    Object.keys(options).forEach((key) => {
      this[key] = options[key];
    });
  }
}

export const RecentBookBlockSchema = SchemaFactory.createForClass(RecentBookBlock);

RecentBookBlockSchema.index(
  {
    from: 1, reaction: 1,
  },
);

RecentBookBlockSchema.index(
  {
    from: 1, bookId: 1,
  },
);

export type RecentBookBlockDocument = HydratedDocument<RecentBookBlock>;
