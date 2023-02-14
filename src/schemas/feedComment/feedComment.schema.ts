import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { FeedPost } from '../feedPost/feedPost.schema';
import { Image, ImageSchema } from '../shared/image.schema';
import { User } from '../user/user.schema';
import { FeedCommentDeletionState } from './feedComment.enums';
import { FeedCommentUnusedFields } from './feedComment.unused-fields';

@Schema({ timestamps: true })
export class FeedComment extends FeedCommentUnusedFields {
  /***********
   * Fields *
   ***********/

  readonly _id: mongoose.Schema.Types.ObjectId;

  @Prop({ default: null, ref: FeedPost.name, required: true })
  feedPostId: mongoose.Schema.Types.ObjectId;

  @Prop({ default: null, ref: User.name, required: true })
  userId: mongoose.Schema.Types.ObjectId;

  @Prop({ default: null, required: true })
  message: string;

  @Prop({ type: [ImageSchema] })
  images: Image[];

  @Prop({
    required: true,
    enum: [
      FeedCommentDeletionState.NotDeleted,
      FeedCommentDeletionState.Deleted,
    ],
    default: FeedCommentDeletionState.NotDeleted,
  })
  is_deleted: FeedCommentDeletionState;

  @Prop()
  createdAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  @Prop()
  updatedAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  @Prop({ default: [] })
  likes: mongoose.Schema.Types.ObjectId[];

  /***********
   * Methods *
   ***********/

  constructor(options?: Partial<FeedComment>) {
    super();
    if (!options) {
      return;
    }
    Object.keys(options).forEach((key) => {
      this[key] = options[key];
    });
  }
}

export const FeedCommentSchema = SchemaFactory.createForClass(FeedComment);
FeedCommentSchema.index(
  {
    feedPostId: 1, status: 1, is_deleted: 1, createdAt: 1,
  },
);
FeedCommentSchema.index(
  {
    feedPostId: 1, status: 1, is_deleted: 1,
  },
);
FeedCommentSchema.index(
  {
    status: 1, is_deleted: 1,
  },
);

export type FeedCommentDocument = HydratedDocument<FeedComment>;
