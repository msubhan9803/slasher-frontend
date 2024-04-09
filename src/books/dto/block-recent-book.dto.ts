import { IsMongoId, IsNotEmpty } from 'class-validator';

export class BlockRecentBookDto {
  @IsNotEmpty()
  @IsMongoId()
  bookId: string;
}
