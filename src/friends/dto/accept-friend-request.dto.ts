import { IsMongoId, IsNotEmpty } from 'class-validator';

export class AcceptFriendRequestDto {
  @IsNotEmpty()
  @IsMongoId()
  userId: string;
}
