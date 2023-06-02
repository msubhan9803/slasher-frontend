import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { ReportUserSchema, ReportUser } from '../shared/reportUser.schema';
import {
  FeedPostMatureRating, FeedPostShareListType, FeedPostType,
} from './feedPost.enums';

export class FeedPostUnusedFields {
  // NOT USED
  @Prop({ type: [ReportUserSchema] })
  reportUsers: ReportUser[];

  // NOT USED
  // Also, in current DB, 0 feedPosts actually store any values for this field. Seems completely unused.
  @Prop({ default: [] })
  shareUsers: mongoose.Schema.Types.ObjectId[];

  // NOT USED
  // Note: The current DB mostly used FeedPostType.Text and FeedPostType.Image,
  // but there are 36 posts of type FeedPostType.TextAndImages (15 are from a test account, 8 are
  // from Damon, and the other 13 seem to be a mix of possible test account or possible real users)
  @Prop({
    required: true,
    enum: [
      FeedPostType.Text,
      FeedPostType.Images,
      FeedPostType.TextAndImages,
      FeedPostType.Others1,
      FeedPostType.Others2,
    ],
    default: FeedPostType.Text,
  })
  type: FeedPostType;

  // NOT USED
  @Prop({ default: null })
  shareId: string;

  // NOT USED
  @Prop({ default: null })
  vendorUrl: string;

  // NOT USED
  @Prop({ default: null })
  vendorTitle: string;

  // NOT USED
  @Prop({
    required: true,
    enum: [
      FeedPostMatureRating.NotMature,
      FeedPostMatureRating.Mature,
    ],
    default: FeedPostMatureRating.NotMature,
  })
  mature: FeedPostMatureRating;

  // NOT USED
  // Note: In DB, nearly all posts have type NoSharedPost.  Only 36 posts have a non-1 value, so
  // it seems like this was probably only used in an early testing phase. (15 are from a test
  // account, 8 are from Damon, and the other 13 seem to be a mix of possible test account or
  // possible real users).
  @Prop({
    required: true,
    enum: [
      FeedPostShareListType.NoSharedPost,
      FeedPostShareListType.FavoriteMovie,
      FeedPostShareListType.WatchList,
      FeedPostShareListType.WatchedList,
      FeedPostShareListType.BuyList,
    ],
    default: FeedPostShareListType.NoSharedPost,
  })
  sharedList: FeedPostShareListType;

  // Do not rely on this field.  It was used at some point in the old API, but does not seem to be
  // used anymore.  The last record to use it was created in January of 2020, so we'll ignore it for
  // now.  Use the "likes" array field instead to see how many likes a post has.  Maybe one day
  // we'll start using it again, as a cache for the like count.
  @Prop({ default: 0 })
  likeCount: number;

  @Prop({ default: false })
  skipthat: boolean;
}
