import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User, UserDocument } from '../user/user.schema';
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

  @Prop({ default: null, ref: User.name, required: true })
  from: mongoose.Schema.Types.ObjectId;

  @Prop({ default: null, ref: User.name, required: true })
  to: mongoose.Schema.Types.ObjectId;

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

export type FriendDocument = Friend & Document;
