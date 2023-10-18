// For shared types

import mongoose from 'mongoose';
import { FriendRequestReaction } from './schemas/friend/friend.enums';
import { User } from './schemas/user/user.schema';

export const VALID_REPORT_TYPES = ['profile', 'post', 'comment', 'reply'] as const; // "as const" makes it readonly
export type ReportType = typeof VALID_REPORT_TYPES[number];

export type RegisterUser = Partial<
{
  firstName: string,
  userName: string,
  email: string,
  password: string,
  passwordConfirmation: string,
  securityQuestion: string,
  securityAnswer: string,
  dob: string,
}>;

export type LocationType = {
  type: 'Point',
  coordinates: [number, number]
};
export enum WorthWatchingStatus {
  NoRating = 0,
  Down = 1,
  Up = 2,
}
export enum WorthReadingStatus {
  NoRating = 0,
  Down = 1,
  Up = 2,
}
export type FriendShip = { from?: User, to?: User, friendship?: FriendRequestReaction } | null;
export type LikeUserAndFriendship = {
  _id: mongoose.Schema.Types.ObjectId;
  userName: string;
  profilePic: string;
  firstName: string;
  friendship?: FriendShip;
};

export const CommentsSortBy = ['newestFirst', 'oldestFirst'] as const;
export type CommentsSortByType = typeof CommentsSortBy[number];

export const HashtagsSortBy = ['name', 'createdAt', 'totalPost', 'deleted'] as const;
export type HashtagsSortByType = typeof HashtagsSortBy[number];
