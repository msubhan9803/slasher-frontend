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
  castImage?: string;
  name: string;
  characterName: string;
}[];

export type TrailerLinks = {
  main: string;
  trailer2: string;
  trailer3: string;
};
