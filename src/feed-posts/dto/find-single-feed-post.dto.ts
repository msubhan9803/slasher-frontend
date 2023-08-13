import { IsMongoId, IsString } from 'class-validator';

export class SingleFeedPostsDto {
  @IsMongoId()
  @IsString()
  id: string;
}
