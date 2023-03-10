/* eslint-disable max-classes-per-file */
import { Transform, Type } from 'class-transformer';
import {
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

export class MoviePostDto {
  @IsNotEmpty()
  @MaxLength(150)
  title: string;

  @IsNotEmpty()
  @IsBoolean()
  @Transform(({ value }) => (value === 'true'))
  spoilers: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Max(5)
  @Min(1)
  @IsInt()
  rating: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Max(5)
  @Min(1)
  @IsInt()
  goreFactorRating: number;

  @IsOptional()
  @IsIn([WorthWatchingStatus.Down, WorthWatchingStatus.Up])
  @Type(() => Number)
  @IsNumber()
  worthWatching: WorthWatchingStatus;
}

export class CreateFeedPostsDto {
  @IsOptional()
  @MaxLength(20000, { message: 'message cannot be longer than 20,000 characters' })
  message?: string;

  @IsNotEmpty()
  @IsIn([PostType.MovieReview, PostType.News, PostType.User])
  @Type(() => Number)
  @IsNumber()
  postType: PostType;

  @IsOptional()
  @Type(() => MoviePostDto)
  @ValidateNested()
  moviePostFields: MoviePostDto;

  @IsOptional()
  @IsMongoId()
  movieId: mongoose.Schema.Types.ObjectId;
}
