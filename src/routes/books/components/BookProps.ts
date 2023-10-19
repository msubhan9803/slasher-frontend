import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

export type Book = {
  _id: string,
  name: string,
  author: string[],
  description: string,
  numberOfPages: number,
  isbnNumber: Array<string>,
  publishDate: string
  covers: Array<number>
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
