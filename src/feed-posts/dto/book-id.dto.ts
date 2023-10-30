import { IsMongoId, IsNotEmpty } from 'class-validator';

export class BookIdDto {
  @IsNotEmpty()
  @IsMongoId()
  bookId: string;
}
