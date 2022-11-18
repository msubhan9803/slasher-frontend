import { IsMongoId, IsNotEmpty } from 'class-validator';

export class CancelFriendshipOrDeclineRequestDto {
  @IsNotEmpty()
  @IsMongoId()
  userId: string;
}
