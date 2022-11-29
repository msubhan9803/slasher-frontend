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
  hashTag?: string[];
}

export interface User {
  id: string;
  firstName: string;
  userName: string;
  email: string;
  profilePic: string;
  coverPhoto: string;
  aboutMe: string;
}

export interface MessagesList {
  _id: string;
  unreadCount: number;
  latestMessage: string;
  updatedAt: string;
  user: UserMesssage
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
  createdAt: string;
  feedPostId: string;
  hideUsers: any;
  images: any;
  is_deleted: number;
  likes: any;
  message: string;
  replies: any;
  reportUsers: any;
  status: number;
  type: number;
  updatedAt: string;
  userId: FeedCommentUserId;
  __v: number;
  _id: string;
}

interface FeedCommentUserId {
  _id: string;
  userName: string;
  profilePic: string;
}
