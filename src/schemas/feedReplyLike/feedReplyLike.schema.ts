import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { FeedReply } from '../feedReply/feedReply.schema';
import { User } from '../user/user.schema';
import { FeedReplyLikeUnusedFields } from './feedReplyLike.unused-fields';

@Schema({ timestamps: true })
export class FeedReplyLike extends FeedReplyLikeUnusedFields {
  /***********
   * Fields *
   ***********/

  readonly _id: mongoose.Schema.Types.ObjectId;

  @Prop()
  createdAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  @Prop()
  updatedAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: FeedReply.name })
  feedReplyId: FeedReply;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  userId: User;

  /***********
   * Methods *
   ***********/

  constructor(options?: Partial<FeedReplyLike>) {
    super();
    if (!options) {
      return;
    }
    Object.keys(options).forEach((key) => {
      this[key] = options[key];
    });
  }
}

export const FeedReplyLikeSchema = SchemaFactory.createForClass(FeedReplyLike);

export type FeedReplyLikeDocument = FeedReplyLike & Document;
