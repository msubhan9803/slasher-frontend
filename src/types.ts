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
