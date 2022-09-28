import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { FriendRequestReaction } from './friend.enums';

export class FriendUnusedFields {
  // NOT USED
  @Prop({ default: null, ref: 'users', required: true })
  to: mongoose.Schema.Types.ObjectId;

  // NOT USED
  @Prop({ default: null, ref: 'users', required: true })
  from: mongoose.Schema.Types.ObjectId;

  // NOT USED
  @Prop({ default: null, ref: 'relations', required: true })
  relationId: mongoose.Schema.Types.ObjectId;

  // NOT USED
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

  @Prop({ default: null })
  reasonOfReport: string;

  @Prop({ default: Date.now })
  created: Date;
}
