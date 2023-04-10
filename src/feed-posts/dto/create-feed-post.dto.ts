/* eslint-disable max-classes-per-file */
import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsBoolean,
  IsIn,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional, Max, MaxLength, Min, ValidateNested,
} from 'class-validator';
import mongoose from 'mongoose';
import { PostType } from '../../schemas/feedPost/feedPost.enums';
import { WorthWatchingStatus } from '../../types';
import { MAX_ALLOWED_UPLOAD_FILES_FOR_POST } from '../../constants';

export class MoviePostDto {
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
  @IsIn([WorthWatchingStatus.Down, WorthWatchingStatus.Up])
  @Type(() => Number)
  @IsNumber()
  worthWatching: WorthWatchingStatus;
}

export class ImageDescriptionsDto {
  @MaxLength(250, { each: true }) // set maximum length of each string inside the array
  description: string;
}

export class CreateFeedPostsDto {
  @IsOptional()
  @MaxLength(20000, { message: 'message cannot be longer than 20,000 characters' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  message?: string;

  @IsNotEmpty()
  @IsIn([PostType.MovieReview, PostType.News, PostType.User])
  @Type(() => Number)
  @IsNumber()
  postType: PostType;

  @IsOptional()
  @Type(() => MoviePostDto)
  @ValidateNested({ each: true })
  moviePostFields: MoviePostDto;

  @IsOptional()
  @IsMongoId()
  movieId: mongoose.Schema.Types.ObjectId;

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : Array(value)))
  @ArrayMaxSize(MAX_ALLOWED_UPLOAD_FILES_FOR_POST, { message: 'Only allow maximum of 10 description' })
  @Type(() => ImageDescriptionsDto)
  @ValidateNested({ each: true })
  imageDescriptions: ImageDescriptionsDto[];
}
