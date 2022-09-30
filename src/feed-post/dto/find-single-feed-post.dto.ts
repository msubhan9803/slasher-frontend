import { IsString } from 'class-validator';

export class SingleFeedPostDto {
  @IsString()
  id: string;
}
