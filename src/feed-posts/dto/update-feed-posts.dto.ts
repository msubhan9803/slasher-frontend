import { Transform } from 'class-transformer';
import {
  IsOptional, MaxLength,
} from 'class-validator';

export class UpdateFeedPostsDto {
  @IsOptional()
  @MaxLength(20000, { message: 'message cannot be longer than 20,000 characters' })
  message?: string;

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : Array(value)))
  imagesToDelete?: string[];
}
