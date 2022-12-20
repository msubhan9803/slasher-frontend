import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { RssFeedProvider } from '../rssFeedProvider/rssFeedProvider.schema';
import { Image, ImageSchema } from '../shared/image.schema';
import { User } from '../user/user.schema';
import { FeedPostDeletionState, FeedPostStatus } from './feedPost.enums';
import { FeedPostUnusedFields } from './feedPost.unused-fields';

@Schema({ timestamps: true })
export class FeedPost extends FeedPostUnusedFields {
  /***********
   * Fields *
   ***********/

  readonly _id: mongoose.Schema.Types.ObjectId;

  @Prop()
  createdAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  @Prop()
  updatedAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  @Prop({ default: null, ref: User.name, required: true })
  userId: mongoose.Schema.Types.ObjectId;

  @Prop({ default: null })
  message: string;

  @Prop({ type: [ImageSchema] })
  images: Image[];

  @Prop({
    required: true,
    enum: [
      FeedPostStatus.Inactive,
      FeedPostStatus.Active,
    ],
    default: FeedPostStatus.Active,
  })
  status: FeedPostStatus;

  @Prop({
    required: true,
    enum: [
      FeedPostDeletionState.NotDeleted,
      FeedPostDeletionState.Deleted,
    ],
    default: FeedPostDeletionState.NotDeleted,
  })
  is_deleted: FeedPostDeletionState;

  @Prop({ default: null, ref: RssFeedProvider.name })
  rssfeedProviderId: mongoose.Schema.Types.ObjectId;

  @Prop({ default: 0 })
  commentCount: number;

  // The actual values in this field seem to be mostly used for displaying the count of the number
  // of likes a post has, so it might be possible to change this field to likeCount
  // and just have it store a number.  Feed post likes are also (redundantly) stored in the
  // feedpostlikes collection, and feedpostlikes entries are used to check whether or not the
  // current user has liked something.
  @Prop({ default: [] })
  likes: mongoose.Schema.Types.ObjectId[];

  @Prop({ default: Date.now })
  lastUpdateAt: Date;

  /***********
   * Methods *
   ***********/

  constructor(options?: Partial<FeedPost>) {
    super();
    if (!options) {
      return;
    }
    Object.keys(options).forEach((key) => {
      this[key] = options[key];
    });
  }
}

export const FeedPostSchema = SchemaFactory.createForClass(FeedPost);

export type FeedPostDocument = FeedPost & Document;
