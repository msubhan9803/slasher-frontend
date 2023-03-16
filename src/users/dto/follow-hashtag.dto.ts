import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class FollowHashtagDto {
  @IsNotEmpty()
  @IsMongoId()
  userId: string;

  @IsNotEmpty()
  @IsString()
  hashtag: string;
}
