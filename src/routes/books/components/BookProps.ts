import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

export interface BooksProps {
  id: number,
  name: string,
  logo: string,
  year: string,
  liked: boolean,
}
export interface BookIconProps {
  label: string;
  icon: IconDefinition;
  iconColor: string;
  margin?: string;
  width: string;
  height: string;
  addBook: boolean;
}
