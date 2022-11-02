import { IsMongoId, IsNotEmpty } from 'class-validator';

export class DeclineOrCancelFriendRequestDto {
  @IsNotEmpty()
  @IsMongoId()
  userId: string;
}
