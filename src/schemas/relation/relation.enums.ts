// Note: It's unfortunate that these are strings rather than numbers, but we need to keep them
// as strings in the database to be compatible with the old API.
export enum RelationStatus {
  Inactive = '0',
  Active = '1',
}

export enum RelationDeletionState {
  NotDeleted = 0,
  Deleted = 1,
}
