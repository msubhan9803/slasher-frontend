export enum RssFeedProviderFollowNotificationsEnabled {
  NotEnabled = 0,
  Enabled = 1,
}

export enum RssFeedProviderFollowStatus {
  Inactive = 0,
  Active = 1,
  Deactivated = 2,
}

// This is 0, 100% of the time, so this field basically isn't used.  We can ignore it.
export enum RssFeedProviderFollowDeletionStatus {
  NotDeleted = 0,
  Deleted = 1,
}
