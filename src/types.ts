/* eslint-disable max-lines */
// This file can be used for declaring TypeScript types/interfaces
// that are shared across multiple places in the app.

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
  content: string;
  postUrl: PostImage[];
  userName: string;
  firstName: string;
  profileImage: string;
  commentCount: number;
  likeCount: number;
  sharedList: number;
  likeIcon: boolean;
  likes?: string[];
  hashTag?: string[];
  userId?: string
}

export interface User {
  id: string;
  firstName: string;
  userName: string;
  email: string;
  profilePic: string;
  coverPhoto: string;
  aboutMe: string;
  profile_status: number;
}

export interface NewsPartnerPostProps {
  _id: string;
  id: string;
  postDate: string;
  content: string;
  images: PostImage[];
  title: string;
  rssFeedProviderLogo: string;
  commentCount: number;
  likeCount: number;
  sharedList: number;
  hashTag: string[];
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
  UserLikedYourPost = 13,
  UserLikedYourComment = 14,
  UserCommentedOnYourPost = 15,
  UserMentionedYouInPost = 99,
  UserMentionedYouInAComment_MentionedYouInACommentReply_LikedYourReply_RepliedOnYourPost = 101,
  NewPostFromFollowedRssFeedProvider = 125,
}

export interface Notification {
  _id: string;
  createdAt: string,
  isRead: number,
  notificationMsg: string,
  senderId: Sender,
  feedPostId: NotificationFeedPostId,
  feedCommentId: String,
  feedReplyId: String,
  userId: String,
  rssFeedProviderId: NotificationRssFeedProviderId,
  rssFeedId: String,
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
export interface CommentValue {
  commentMessage: string,
  imageArray?: string[],
  commentId?: string,
}
export interface ReplyValue {
  replyMessage: string,
  commentId?: string,
  imageArray?: string[],
  replyId?: string,
}
