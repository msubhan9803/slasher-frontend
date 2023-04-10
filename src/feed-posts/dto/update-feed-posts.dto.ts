/* eslint-disable max-classes-per-file */
import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsOptional, MaxLength, ValidateNested,
} from 'class-validator';
import { MoviePostDto } from './create-feed-post.dto';
import { MAX_ALLOWED_UPLOAD_FILES_FOR_POST } from '../../constants';

export class UpdateImageDescriptionsDto {
  @IsOptional()
  _id: string;

  @IsOptional()
  @MaxLength(250, { each: true }) // set maximum length of each string inside the array
  description: string;
}

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

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : Array(value)))
  @ArrayMaxSize(MAX_ALLOWED_UPLOAD_FILES_FOR_POST, { message: 'Only allow maximum of 10 description' })
  @Type(() => UpdateImageDescriptionsDto)
  @ValidateNested({ each: true })
  imageDescriptions: UpdateImageDescriptionsDto[];
}
