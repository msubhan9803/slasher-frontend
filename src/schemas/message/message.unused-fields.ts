import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from '../user/user.schema';
import { MessageStatus } from './message.enums';

export class MessageUnusedFields {
  // Currently not clear if this is used or how often it is used
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  movieId: User;

  // Currently not clear if this is used or how often it is used
  // Comment in old code describes this as "Movie List"
  @Prop({ type: Array, default: [] })
  urls: any[];

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
