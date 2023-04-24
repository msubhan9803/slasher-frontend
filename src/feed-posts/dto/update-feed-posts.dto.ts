import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  IsOptional, MaxLength, ValidateNested,
} from 'class-validator';
import { MoviePostDto } from './create-feed-post.dto';

export class UpdateFeedPostsDto {
  @IsOptional()
  @MaxLength(20000, { message: 'message cannot be longer than 20,000 characters' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  message?: string;

  @IsOptional()
  @Type(() => MoviePostDto)
  @ValidateNested()
  moviePostFields: MoviePostDto;

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : Array(value)))
  imagesToDelete?: string[];
}
