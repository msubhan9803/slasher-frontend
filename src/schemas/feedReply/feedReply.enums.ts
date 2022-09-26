// The options below might not make sense, but this is what is done in the old API
export enum FeedReplyType {
  LocalMovieDb = 0,
  ExternalMovieDb = 1,
}

export enum FeedReplyStatus {
  Inactive = 0,
  Active = 1,
  Deactivated = 2,
}

export enum FeedReplyDeletionState {
  NotDeleted = 0,
  Deleted = 1,
}
