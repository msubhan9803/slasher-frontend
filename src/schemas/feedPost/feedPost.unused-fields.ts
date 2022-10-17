import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { ReportUserSchema, ReportUser } from '../shared/reportUser.schema';
import {
  FeedPostMatureRating, FeedPostPrivacyType, FeedPostShareListType, FeedPostType,
} from './feedPost.enums';

export class FeedPostUnusedFields {
  // NOT USED
  @Prop({ default: null, ref: 'movies' })
  movieId: mongoose.Schema.Types.ObjectId;

  // NOT USED
  @Prop({ default: null, ref: 'rssFeed' })
  rssFeedId: mongoose.Schema.Types.ObjectId;

  // NOT USED
  @Prop({ type: [ReportUserSchema] })
  reportUsers: ReportUser[];

  // NOT USED
  @Prop({ default: [] })
  hideUsers: mongoose.Schema.Types.ObjectId[];

  // NOT USED
  // Also, in current DB, 0 feedPosts actually store any values for this field. Seems completely unused.
  @Prop({ default: [] })
  shareUsers: mongoose.Schema.Types.ObjectId[];

  // NOT USED
  // The actual values in this field seem to be mostly used for displaying the count of the number
  // of likes a post has, so it might be possible to change this field to likeCount
  // and just have it store a number.  Feed post likes are also (redundantly) stored in the
  // feedpostlikes collection, and feedpostlikes entries are used to check whether or not the
  // current user has liked something.
  @Prop({ default: [] })
  likes: mongoose.Schema.Types.ObjectId[];

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
    ],
    default: FeedPostType.Text,
  })
  type: FeedPostType;

  // NOT USED
  @Prop({
    required: true,
    enum: [
      FeedPostPrivacyType.Public,
      FeedPostPrivacyType.Private,
    ],
    default: FeedPostPrivacyType.Public,
  })
  privacyType: FeedPostPrivacyType;

  // NOT USED
  @Prop({ default: Date.now })
  lastUpdateAt: Date;

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

  @Prop({ default: 0 })
  likeCount: number;

  @Prop({ default: 0 })
  commentCount: number;

  @Prop({ default: false })
  skipthat: boolean;
}
