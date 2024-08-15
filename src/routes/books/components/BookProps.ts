import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

export type Book = {
  _id: string,
  name: string,
  coverImage: { image_path: string }
  publishDate: string
  rating: string
  worthReading: string
};

export interface BookIconProps {
  label: string;
  key: string;
  icon: IconDefinition;
  iconColor: string;
  margin?: string;
  width: string;
  height: string;
  addBook: boolean;
}
export interface BookReviewDataProp {
  publishDate: string;
  description: string;
  coverEditionKey: string;
  bookId: string;
  status: number;
  deleted: number;
  isbnNumber: string[];
  numberOfPages: number;
  author: string[];
  name: string;
  rating: number;
  ratingUsersCount: number;
  goreFactorRating: number;
  goreFactorRatingUsersCount: number;
  worthReading: number;
  worthReadingUpUsersCount: number;
  worthReadingDownUsersCount: number;
  userData: {
    rating: number;
    goreFactorRating: number;
    worthReading: number;
    reviewPostId: string;
  };
  coverImage: {
    image_path: string;
    description: string | null;
    _id: string;
  };
  _id?: string;
  buyUrl?: string;
}
