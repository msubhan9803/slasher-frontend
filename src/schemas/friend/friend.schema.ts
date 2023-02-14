import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../user/user.schema';
import { FriendRequestReaction } from './friend.enums';
import { FriendUnusedFields } from './friend.unused-fields';

@Schema({ timestamps: true })
export class Friend extends FriendUnusedFields {
  /***********
   * Fields *
   ***********/

  readonly _id: mongoose.Schema.Types.ObjectId;

  @Prop()
  createdAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  @Prop()
  updatedAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  @Prop({
    type: mongoose.Schema.Types.ObjectId, default: null, ref: User.name, required: true,
  })
  from: User;

  @Prop({
    type: mongoose.Schema.Types.ObjectId, default: null, ref: User.name, required: true,
  })
  to: User;

  @Prop({
    required: true,
    enum: [
      FriendRequestReaction.DeclinedOrCancelled,
      FriendRequestReaction.Accepted,
      FriendRequestReaction.Pending,
    ],
    default: FriendRequestReaction.Pending,
  })
  reaction: FriendRequestReaction;

  /***********
   * Methods *
   ***********/

  constructor(options?: Partial<Friend>) {
    super();
    if (!options) {
      return;
    }
    Object.keys(options).forEach((key) => {
      this[key] = options[key];
    });
  }
}

export const FriendSchema = SchemaFactory.createForClass(Friend);
FriendSchema.index(
  {
    from: 1, reaction: 1,
  },
);
FriendSchema.index(
  {
    to: 1, reaction: 1,
  },
);
FriendSchema.index(
  {
    from: 1, to: 1,
  },
);
FriendSchema.index(
  {
    reaction: 1,
  },
);
FriendSchema.index(
  {
    from: 1, to: 1, reaction: 1,
  },
);

export type FriendDocument = HydratedDocument<Friend>;

