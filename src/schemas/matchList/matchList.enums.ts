export enum MatchListRoomCategory {
  MultiUserRoom = 0,
  DirectMessage = 1,
}

export enum MatchListRoomType {
  Public = 0,
  Match = 1,
  Private = 2,
}

// Unfortunately, this enum is backed by strings to ensure compatibility with the old API. Using
// numeric values would have been better.
export enum MatchListStatus {
  Pending = '0',
  Accepted = '1',
  Rejected = '2',
}

export enum MatchListFlag {
  MatchUser = 0,
  NormalUser = 1,
}
