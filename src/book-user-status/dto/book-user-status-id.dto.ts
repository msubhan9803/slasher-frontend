import { IsMongoId, IsNotEmpty } from 'class-validator';

export class BookUserStatusIdDto {
  @IsNotEmpty()
  @IsMongoId()
  bookId: string;
}
