export interface MoviesProps {
  id: number,
  name: string,
  image: string,
  year: string,
  liked: boolean,
  _id?: string | null,
}

export interface MovieDataProp {
  _id?: string;
  name: string;
  sort_name?: string;
  sortReleaseDate?: string;
  trailerUrls?: string[];
  countryOfOrigin?: string;
  durationInMinutes?: number;
  contentRating?: string | null;
  rating: number;
  ratingUsersCount: number;
  goreFactorRating: number;
  goreFactorRatingUsersCount: number;
  worthWatching: number;
  worthWatchingUpUsersCount: number;
  worthWatchingDownUsersCount: number;
  sortRatingAndRatingUsersCount?: string;
  status: number;
  deleted: number;
  releaseDate: string;
  descriptions: string;
  logo?: string | null;
  movieDBId?: string | null;
  backDropPath?: string | null;
  adult: boolean;
  type?: number;
  popularity?: number;
  movieImage: string;
  casts?: {
    castImage?: string;
    name: string;
    characterName: string;
    _id?: string;
  }[];
  watchUrl?: string;
  userRef?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}
