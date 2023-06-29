/* eslint-disable max-classes-per-file */
import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional, Max, MaxLength, Min, ValidateNested,
} from 'class-validator';
import { WorthWatchingStatus } from '../../types';
import { MAX_ALLOWED_UPLOAD_FILES_FOR_POST } from '../../constants';

export class UpdateImageDescriptionsDto {
  @IsOptional()
  _id: string;

  @IsOptional()
  @MaxLength(250, { message: 'description cannot be longer than 250 characters', each: true })
  description: string;
}

class UpdateMoviePostDto {
  @IsNotEmpty({ message: 'spoilers should not be empty' })
  @IsBoolean()
  @Transform(({ value }) => (value === 'true'))
  spoilers: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Max(5, { message: 'rating must be less than 5' })
  @Min(1, { message: 'rating must be greater than 1' })
  @IsInt()
  rating: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Max(5, { message: 'goreFactorRating must be less than 5' })
  @Min(1, { message: 'goreFactorRating must be greater than 1' })
  @IsInt()
  goreFactorRating: number;

  @IsOptional()
  @IsIn([WorthWatchingStatus.NoRating, WorthWatchingStatus.Down, WorthWatchingStatus.Up])
  @Type(() => Number)
  @IsInt()
  worthWatching: WorthWatchingStatus;
}

export class UpdateFeedPostsDto {
  @IsOptional()
  @MaxLength(20000, { message: 'message cannot be longer than 20,000 characters' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  message?: string;

  @IsOptional()
  @Type(() => UpdateMoviePostDto)
  @ValidateNested()
  moviePostFields: UpdateMoviePostDto;

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
