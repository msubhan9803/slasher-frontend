import { IsNotEmpty, IsString } from 'class-validator';

export class HashtagDto {
  @IsNotEmpty()
  @IsString()
  hashtag: string;
}
