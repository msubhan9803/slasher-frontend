export enum FeedPostType {
  Text = 1,
  Images = 2,
  TextAndImages = 3,
  // Some feedPosts like rssFeedPosts have weird values too like 5 and 6. Note: Adding below values here
  // is necessary otherwise `create-report` api fails due to schema validation of enum type for `feedPost.type` field
  Others1 = 5,
  Others2 = 6,
}

export enum FeedPostStatus {
  Inactive = 0,
  Active = 1,
}

export enum FeedPostPrivacyType {
  Public = 1,
  Private = 2,
}

export enum FeedPostMatureRating {
  NotMature = 0,
  Mature = 1,
}

export enum FeedPostShareListType {
  NoSharedPost = 0,
  FavoriteMovie = 1,
  WatchList = 2,
  WatchedList = 3,
  BuyList = 4,
}

export enum FeedPostDeletionState {
  NotDeleted = 0,
  Deleted = 1,
}

export enum PostType {
  User = 1,
  News = 2,
  MovieReview = 3,
  BookReview = 4,
  BusinessListing = 5,
}
