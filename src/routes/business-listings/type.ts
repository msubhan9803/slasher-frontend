export type ListingType = 'movies' | 'books';

export enum BusinessType {
  VENDOR = 'vendor',
  ARTIST = 'artist',
  BOOKS = 'books',
  MOVIES = 'movies',
  PODCASTER = 'podcaster',
  VIDEO_CREATOR = 'video creator',
  MUSICIAN = 'musician',
}

export type Cast = {
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
  businesstype: BusinessType | null;
  listingType: string | null;
  image: File | null | undefined | string;
  title: string | null;
  overview: string | null;
  link: string | null;
  isActive: boolean | null;

  author?: string | null;
  pages?: number | null;
  isbn?: string | null;

  yearReleased?: number | null;
  countryOfOrigin?: string | null;
  durationInMinutes?: number | null;
  officialRatingReceived?: string | null;
  trailerLinks?: TrailerLinks | null;
  casts?: Cast[];
};

export type BusinessListingKeys = keyof BusinessListing;
