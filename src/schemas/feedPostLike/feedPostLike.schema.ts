import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { FeedPost } from '../feedPost/feedPost.schema';
import { User } from '../user/user.schema';
import { FeedPostLikeUnusedFields } from './feedPostLike.unused-fields';

@Schema({ timestamps: true })
export class FeedPostLike extends FeedPostLikeUnusedFields {
  /***********
   * Fields *
   ***********/

  readonly _id: mongoose.Schema.Types.ObjectId;

  @Prop()
  createdAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  @Prop()
  updatedAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: FeedPost.name })
  feedPostId: FeedPost;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  userId: User;

  /***********
   * Methods *
   ***********/

  constructor(options?: Partial<FeedPostLike>) {
    super();
    if (!options) {
      return;
    }
    Object.keys(options).forEach((key) => {
      this[key] = options[key];
    });
  }
}

export const FeedPostLikeSchema = SchemaFactory.createForClass(FeedPostLike);

FeedPostLikeSchema.index(
  {
    feedPostId: 1, userId: 1,
  },
);

export type FeedPostLikeDocument = HydratedDocument<FeedPostLike>;
