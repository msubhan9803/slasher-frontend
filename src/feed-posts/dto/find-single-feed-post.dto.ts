import { IsString } from 'class-validator';

export class SingleFeedPostsDto {
  @IsString()
  id: string;
}
