import { IsMongoId, IsNotEmpty } from 'class-validator';

export class BlockSuggestedFriendDto {
  @IsNotEmpty()
  @IsMongoId()
  userId: string;
}
