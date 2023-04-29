/* eslint-disable max-lines */
// This file can be used for declaring TypeScript types/interfaces
// that are shared across multiple places in the app.

import { LatLngLiteral } from 'leaflet';
import { BREAK_POINTS } from './constants';

export type BreakPointName = keyof typeof BREAK_POINTS;

export interface ValueLabelPair {
  value: string;
  label: string;
}

export interface PostImage {
  image_path: string;
}

export interface Post {
  _id: string;
  id: string;
  postDate: string;
  message: string;
  images: PostImage[];
  userName: string;
  firstName: string;
  profileImage: string;
  commentCount: number;
  likeCount: number;
  sharedList: number;
  likeIcon: boolean;
  likedByUser: boolean;
  likes?: string[];
  hashTag?: string[];
  userId?: string
}

export interface User {
  _id: string;
  firstName: string;
  userName: string;
  email: string;
  profilePic: string;
  coverPhoto: string;
  aboutMe: string;
  profile_status: number;
  friendshipStatus: FriendshipStatus;
}

export interface NewsPartnerPostProps {
  _id: string;
  id: string;
  postDate: string;
  message: string;
  images: PostImage[];
  title: string;
  rssFeedProviderLogo: string;
  commentCount: number;
  likeCount: number;
  sharedList: number;
  hashTag: string[];
  likedByUser: boolean;
  commentSection: boolean;
  likeIcon: boolean;
  likes: string[];
}

export interface AdditionalMovieData {
  cast: MovieCast;
  video: Video[];
  mainData: MainData;
}

export interface MovieCast {
  profile_path: string;
  name: string;
  character: string,
}

export interface Video {
  key: string;
}

export interface MainData {
  title: string;
  release_date: string;
  poster_path: string;
  original_title: string;
  overview: string;
  release_dates: any;
  runtime: number;
  production_countries: Country[];
}

export interface Country {
  iso_3166_1: string;
  name: string;
}

export interface MovieReleaseDate {
  results: MovieReleaseResults[];
}

export interface MovieReleaseResults {
  iso_3166_1: string;
  release_dates: ReleaseDate[];
}

export interface ReleaseDate {
  certification: string;
}

export interface MessagesList {
  _id: string;
  unreadCount: number;
  latestMessage: string;
  updatedAt: string;
  participants: UserMesssage[]
}

export interface UserMesssage {
  _id: string;
  userName: string;
  profilePic: string;
}

export enum FriendRequestReaction {
  DeclinedOrCancelled = 0,
  MaybeDatingDislike = 1,
  MaybeDatingLike = 2,
  Accepted = 3,
  Blocked = 4,
  Pending = 5,
}

export interface FeedComments {
  id: string;
  createdAt: string;
  feedPostId: string;
  hideUsers: any;
  images: any;
  is_deleted: number;
  likedByUser: boolean;
  message: string;
  replies: FeedReplies[];
  reportUsers: any;
  status: number;
  type: number;
  updatedAt: string;
  userId: FeedCommentUserId;
  __v: number;
  _id: string;
  likeCount: number;
  commentCount: number;
  isReplyIndex?: number;
}

interface FeedCommentUserId {
  _id: string;
  userName: string;
  profilePic: string;
}

interface NotificationFeedPostId {
  _id: string;
  userId: string;
  postType?: number;
  movieId?: string;
}

interface NotificationRssFeedProviderId {
  _id: string;
  logo: string;
  title: string;
}

export enum NotificationReadStatus {
  Unread = 0,
  Read = 1,
}

export enum NotificationType {
  UserSentYouAFriendRequest = 11,
  UserAcceptedYourFriendRequest = 12,
  UserLikedYourPost = 13,
  UserLikedYourComment = 14,
  UserCommentedOnYourPost = 15,
  UserMentionedYouInPost = 99,
  UserMentionedYouInAComment_MentionedYouInACommentReply_LikedYourReply_RepliedOnYourPost = 101,
  UserMentionedYouInACommentOnANewsPost = 121,
  UserLikedYourCommentOnANewsPost = 122,
  NewPostFromFollowedRssFeedProvider = 125,
}

export interface Notification {
  _id: string;
  createdAt: string,
  isRead: number,
  notificationMsg: string,
  senderId: Sender,
  feedPostId: NotificationFeedPostId,
  feedCommentId: string,
  rssFeedCommentId?: string,
  feedReplyId: string,
  userId: string,
  rssFeedProviderId: NotificationRssFeedProviderId,
  rssFeedId: string,
  notifyType: NotificationType,
}

interface Sender {
  _id: string;
  userName: string;
  profilePic: string;
}

interface FeedReplies {
  createdAt: string;
  feedPostId: string;
  hideUsers: any;
  images: any;
  is_deleted: number;
  likes: string[];
  message: string;
  reportUsers: any;
  status: number;
  type: number;
  updatedAt: string;
  userId: FeedCommentUserId;
  __v: number;
  _id: string;
  likeCount: number;
  commentCount: number;
}

export enum RssFeedProviderFollowNotificationsEnabled {
  NotEnabled = 0,
  Enabled = 1,
}

export enum ProfileVisibility {
  Public = 0,
  Private = 1,
}

export type RegisterUser = Partial<{
  firstName: string,
  userName: string,
  email: string,
  password: string,
  passwordConfirmation: string,
  securityQuestion: string,
  securityAnswer: string,
  dob: string,
}>;

export interface CommentValue {
  commentMessage: string,
  imageArr?: string[],
  commentId?: string,
  images?: any,
  deleteImage?: string[],
}
export interface ReplyValue {
  replyMessage: string,
  commentId?: string,
  imageArr?: string[],
  replyId?: string,
  images?: any,
  deleteImage?: string[],
}
export enum WorthWatchingStatus {
  NoRating = 0,
  Down = 1,
  Up = 2,
}
export enum PostType {
  User = 1,
  News = 2,
  MovieReview = 3,
}
export interface MovieData {
  movieDBId: number;
  // ratings
  rating: number;
  goreFactorRating: number;
  worthWatching: number;
  // number of users who rated for `rating`, `goreFactorRating` and `worthWatching`
  ratingUsersCount: number;
  goreFactorRatingUsersCount: number;
  worthWatchingUpUsersCount: number;
  worthWatchingDownUsersCount: number;
  // ratings by logged-in user
  userData: {
    rating: number;
    goreFactorRating: number;
    worthWatching: number;
    reviewPostId: string;
  }
}
export type LocationPointType = {
  type: 'Point',
  coordinates: [number, number]
};
export type MarkerLocationType = {
  id: string,
  latLng: LatLngLiteral, // { lat: number; lng: number; }
  dateRange: string,
  address: string,
  name: string,
  linkText: string,
  linkAddress: string,
};

export type LikeShareModalTabName = 'like' | 'share' | '';

export type LikeShareModalResourceName = 'feedpost' | 'comment' | 'reply';
export interface FriendshipStatus {
  reaction: number;
  from: string;
  to: string;
}
