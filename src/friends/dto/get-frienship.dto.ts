import { IsMongoId, IsNotEmpty } from 'class-validator';

export class GetFriendshipDto {
  @IsNotEmpty()
  @IsMongoId()
  userId: string;
}
