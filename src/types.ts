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
