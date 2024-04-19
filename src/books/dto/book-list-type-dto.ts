import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { BookListType, bookList } from '../../types';

export class BookListTypeDto {
  @IsNotEmpty()
  @IsIn(bookList)
  @IsString()
  type: BookListType;
}
