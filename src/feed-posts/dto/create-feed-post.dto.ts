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
  IsOptional, IsString, Max, MaxLength, Min, ValidateNested,
} from 'class-validator';
import mongoose from 'mongoose';
import { PostType } from '../../schemas/feedPost/feedPost.enums';
import { WorthReadingStatus, WorthWatchingStatus } from '../../types';
import { MAX_ALLOWED_UPLOAD_FILES_FOR_POST } from '../../constants';

class CreateMoviePostDto {
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

class CreateBookPostDto {
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
  @IsIn([WorthReadingStatus.Down, WorthReadingStatus.Up])
  @Type(() => Number)
  @IsNumber()
  worthReading: WorthReadingStatus;
}
export class ImageDescriptionsDto {
  @MaxLength(250, { message: 'description cannot be longer than 250 characters', each: true })
  description: string;
}

export class CreateFeedPostsDto {
  @IsOptional()
  @MaxLength(20000, { message: 'message cannot be longer than 20,000 characters' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  message?: string;

  @IsNotEmpty()
  @IsIn([PostType.MovieReview, PostType.News, PostType.User, PostType.BookReview])
  @Type(() => Number)
  @IsNumber()
  postType: PostType;

  @IsOptional()
  @Type(() => CreateMoviePostDto)
  @ValidateNested({ each: true })
  moviePostFields: CreateMoviePostDto;

  @IsOptional()
  @Type(() => CreateBookPostDto)
  @ValidateNested({ each: true })
  bookPostFields: CreateBookPostDto;

  @IsOptional()
  @IsMongoId()
  movieId: mongoose.Schema.Types.ObjectId;

  @IsOptional()
  @IsMongoId()
  bookId: mongoose.Schema.Types.ObjectId;

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : Array(value)))
  @ArrayMaxSize(MAX_ALLOWED_UPLOAD_FILES_FOR_POST, { message: 'Only allow maximum of 10 description' })
  @ValidateNested({ each: true })
  @Type(() => ImageDescriptionsDto)
  imageDescriptions: ImageDescriptionsDto[];

  @IsOptional()
  @IsString()
  businessListingRef?: mongoose.Schema.Types.ObjectId | null;
}
