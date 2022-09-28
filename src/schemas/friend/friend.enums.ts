export enum FriendRequestReaction {
  DeclinedOrCancelled = 0,
  MaybeDatingDislike = 1, // Unclear exactly how this value is used in the old API, but it will probably go away when dating is redone
  MaybeDatingLike = 2, // Unclear exactly how this value is used in the old API, but it will probably go away when dating is redone
  Accepted = 3,
  Blocked = 4, // This appears to be unused in the old API and the database. It will probably go away later.
  Pending = 5,
}
