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
