/* eslint-disable max-lines */
// This file can be used for declaring TypeScript types/interfaces
// that are shared across multiple places in the app.

import { LatLngLiteral } from 'leaflet';
import { Location } from 'react-router-dom';
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
  userId?: string;
  postType: number;
  rssfeedProviderId?: string;
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
  unverifiedNewEmail: string;
  imagesCount: number,
  postsCount: number,
  friendsCount: number,
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
  lastMessageSentAt: string;
}

export interface Message {
  _id: string;
  message: string;
  isRead: boolean;
  imageDescription: string;
  createdAt: string;
  image: string;
  urls: string[];
  fromId: string;
  senderId: string; // this means toId
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
  UserMentionedYouInAComment = 201,
  UserMentionedYouInACommentReply = 202,
  UserLikedYourReply = 203,
  UserRepliedOnYourPost = 204,
  UserMentionedYouInACommentOnANewsPost = 121,
  UserLikedYourCommentOnANewsPost = 122,
  NewPostFromFollowedRssFeedProvider = 125,
  FriendMessageNotification = 126,
  NewPostFromFollowedUser = 206,
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
  matchId?: string
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

export interface ContentDescription {
  description: string;
  id?: string;
}
export interface CommentValue {
  commentMessage: string,
  imageArr?: string[],
  commentId?: string,
  images?: any,
  deleteImage?: string[],
  descriptionArr?: ContentDescription[]
}
export interface ReplyValue {
  replyMessage: string,
  commentId?: string,
  imageArr?: string[],
  replyId?: string,
  images?: any,
  deleteImage?: string[],
  descriptionArr?: ContentDescription[]
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
  },
  // to check movieData state update
  isUpdated?: boolean
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

// Cache type for NewsPartner and NewsPartnerPosts cache (page = http://local.slasher.tv:3000/app/news/partner/:id)
export type NewsPartnerAndPostsCache = { newsPartner: any, newsPosts: any };

// Cache type for Movie related data (page = http://localhost:3000/app/movies/64477b42b12f5efbb3468ff4/reviews)
export type MoviePageCache = {
  movieData: MovieData,
  additionalMovieData: AdditionalMovieData,
  reviews: any
};

// Cache type for profile subroutes (i.e, About, Posts, Friends, Photos, Watched list)
export type ProfileSubroutesCache = {
  user?: any,
  allFriends: { page: number, data: any[], searchValue: string }
  friendRequests: { page: number, data: any[] }
  profilePosts: Post[],
};

export interface ConversationListItem {
  unreadCount: number;
  latestMessage: string;
  _id: string; // matchListId
  userId: string;
  userName: string;
  profilePic: string;
  updatedAt: string;
  lastMessageSentAt: string;
}

export enum CommentsOrder { oldestFirst = 'oldestFirst', newestFirst = 'newestFirst' }
export interface DeviceFields {
  device_token: string;
  device_type: string;
  app_version: string;
  device_version: string;
  device_id: string;
}

export interface FormatMentionProps {
  id: string;
  value: string;
  format: string;
}
export type FriendType = {
  from: string,
  to: string,
  reaction: FriendRequestReaction
} | null;

export type LocationOrPathname = Location | string;
