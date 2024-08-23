import { User } from '../../types';
import { BookReviewDataProp } from '../books/components/BookProps';
import { MovieDataProp } from '../movies/components/MovieProps';

export type ListingType = 'movies' | 'books' | 'podcaster' | 'musician' | 'artist' | 'vendor' | 'video_creator';

export enum BusinessType {
  VENDOR = 'vendor',
  ARTIST = 'artist',
  BOOKS = 'books',
  MOVIES = 'movies',
  PODCASTER = 'podcaster',
  VIDEO_CREATOR = 'video_creator',
  MUSICIAN = 'musician',
}

export type Cast = {
  _id?: string | undefined | null;
  castImage?: File | string | null | undefined;
  name: string;
  characterName: string;
};

export type TrailerLinks = {
  main: string;
  trailer2: string;
  trailer3: string;
};

export type BusinessListing = {
  _id: string | null;
  businesstype: BusinessType | null | string;
  listingType: string | null;
  image: File | null | undefined | string;
  businessLogo?: string;
  coverPhoto?: File | null | undefined | string;
  email?: string;
  title?: string | null;
  overview?: string | null;
  link: string | null;
  isActive: boolean | null;
  yearReleased?: number | null;
  address?: string | undefined;
  phoneNumber?: string | null;
  websiteLink?: string | null;

  author?: string | null;
  pages?: number | null;
  isbn?: string | null;

  countryOfOrigin?: string | null;
  durationInMinutes?: number | null;
  officialRatingReceived?: string | null;
  trailerLinks?: TrailerLinks | null;
  casts?: Cast[];

  bookRef?: BookReviewDataProp;
  movieRef?: MovieDataProp;
  userRef?: User;

  createdAt: string;
};

export type BusinessListingKeys = keyof BusinessListing;

export enum ListingName {
  LISTING1 = 'listing_1',
  LISTING2 = 'listing_2',
}

export type BusinessListingType = {
  _id: string;
  name: ListingName;
  label: string;
  features: string[];
  price: number;
};

export enum FileType {
  THUMBNAIL = 'THUMBNAIL',
  COVER_PHOTO = 'COVER_PHOTO',
}

export type EditCastsState = {
  isNew?: boolean;
  isUpdated?: boolean;
  isRemoved?: boolean;
  cast: Cast;
};
