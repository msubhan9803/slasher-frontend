import { IsMongoId, IsNotEmpty } from 'class-validator';

export class CreateFriendRequestDto {
  @IsNotEmpty()
  @IsMongoId()
  userId: string;
}
