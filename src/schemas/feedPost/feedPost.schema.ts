import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Movie } from '../movie/movie.schema';
import { RssFeed } from '../rssFeed/rssFeed.schema';
import { RssFeedProvider } from '../rssFeedProvider/rssFeedProvider.schema';
import { Image, ImageSchema } from '../shared/image.schema';
import { User } from '../user/user.schema';
import {
  FeedPostDeletionState, FeedPostPrivacyType, FeedPostStatus, PostType,
} from './feedPost.enums';
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

  @Prop({ default: null, ref: Movie.name })
  movieId: mongoose.Schema.Types.ObjectId;

  @Prop({ default: null })
  message: string;

  @Prop({ type: [ImageSchema] })
  images: Image[];

  @Prop({ default: [] })
  hideUsers: mongoose.Schema.Types.ObjectId[];

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

  @Prop({ default: null, ref: RssFeed.name })
  rssFeedId: mongoose.Schema.Types.ObjectId;

  // This field is used by the old iOS and Android apps to determine whether a post should be
  // considered "public" in a way.  We should always default to Private.  There isn't a currently
  // existing use case for wanting any posts to be "public" in the old app.
  // NOTE: This field is NOT currently used in the new API, so we can get rid of it as soon as
  // the old Android/iOS apps are retired.
  @Prop({
    required: true,
    enum: [
      FeedPostPrivacyType.Public,
      FeedPostPrivacyType.Private,
    ],
    default: FeedPostPrivacyType.Public,
  })
  privacyType: FeedPostPrivacyType;

  @Prop({
    enum: [
      PostType.User,
      PostType.News,
      PostType.MovieReview,
    ],
    default: PostType.User,
  })
  postType: PostType;

  @Prop({ default: null })
  title: string;

  @Prop({ default: false })
  spoilers: boolean;

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
FeedPostSchema.index(
  {
    userId: 1, createdAt: 1, is_deleted: 1, status: 1,
  },
);
FeedPostSchema.index(
  {
    _id: 1, is_deleted: 1, status: 1,
  },
);
FeedPostSchema.index(
  {
    updatedAt: 1, createdAt: 1, is_deleted: 1, status: 1, rssfeedProviderId: 1, userId: 1,
  },
);

// For UsersService#findMainFeedPostsForUser
FeedPostSchema.index(
  {
    status: 1, is_deleted: 1, userId: 1, rssfeedProviderId: 1, postType: 1, hideUsers: 1, lastUpdateAt: 1,
  },
);

FeedPostSchema.index(
  {
    createdAt: 1, is_deleted: 1, status: 1, rssfeedProviderId: 1,
  },
);
// For movie reviews
FeedPostSchema.index(
  {
    postType: 1, movieId: 1, is_deleted: 1, status: 1, createdAt: 1,
  },
);

FeedPostSchema.index(
  {
    _id: 1, is_deleted: 1, status: 1, userId: 1, rssfeedProviderId: 1, rssFeedId: 1, movieId: 1,
  },
);

export type FeedPostDocument = HydratedDocument<FeedPost>;

// export type FeedPostDocument = FeedPost & Document;
