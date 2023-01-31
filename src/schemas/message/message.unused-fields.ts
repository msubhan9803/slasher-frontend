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
}
