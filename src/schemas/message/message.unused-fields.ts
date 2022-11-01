import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { MatchList } from '../matchList/matchList.schema';
import { Relation } from '../relation/relation.schema';
import { User } from '../user/user.schema';
import { MessageStatus, MessageType } from './message.enums';

export class MessageUnusedFields {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: MatchList.name })
  matchId: MatchList;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Relation.name })
  relationId: Relation;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  fromId: User;

  // Note: This should actually be called toId, but it was improperly in the old API
  // so we need to keep the same name until we retire the old API.
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  senderId: User;

  // Currently not clear if this is used or how often it is used
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  movieId: User;

  // Currently not clear if this is used or how often it is used
  // Comment in old code describes this as "Movie List"
  @Prop({ type: Array, default: [] })
  urls: any[];

  // Right now it's not clear what 0 or 1 mean for MessageType
  @Prop({ default: MessageType.Type0 })
  messageType: MessageType.Type0;

  @Prop({ default: null })
  image: string;

  @Prop({ default: null })
  message: string;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ default: MessageStatus.Active })
  status: MessageStatus;

  @Prop({ default: false })
  deleted: boolean;

  // This is set as a string version of the current date timestamp in the old API, so that's why
  // we're doing that here too (for compatibility).
  @Prop({ default: Date.now })
  created: string;

  // Not entirely clear what this is used for, but this may not be necessary in the new API
  // since we're going to develop a new messaging implementation.
  @Prop({ tyep: Array, default: [] })
  deletefor: mongoose.Schema.Types.ObjectId[];
}
