import { IsNotEmpty, IsArray, ArrayMinSize } from 'class-validator';

export class HashtagsDto {
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  hashtags: string[];
}
