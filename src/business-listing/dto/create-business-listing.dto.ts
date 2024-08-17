/* eslint-disable max-classes-per-file */
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import mongoose from 'mongoose';
import { BusinessType } from '../../schemas/businessListing/businessListing.enums';
import { IsMovieFieldsRequired } from '../decorators/is-movie-fields-required.decorator';
import { IsBookFieldsRequired } from '../decorators/is-book-fields-required.decorator';
import { IsOtherBusinessCommonFieldsRequired } from '../decorators/is-other-business-common-fields-required.decorator';

export class CreateBusinessListingDto {
  @IsEnum(BusinessType, { message: 'Invalid business type' })
  businesstype: BusinessType;

  @IsString()
  listingType: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty({ message: 'Title is required' })
  @IsString()
  title: string;

  @IsNotEmpty({ message: 'Overview is required' })
  @IsString()
  @MaxLength(1010, { message: 'Overview must be less than 1000 characters' })
  overview?: string;

  @IsOptional()
  @IsMovieFieldsRequired({ message: 'Link is required' })
  @IsString()
  link?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true', { toClassOnly: true })
  @IsBoolean()
  isActive?: boolean;

  /***********
   * Fields for other businesses *
   ***********/
  @IsOptional()
  @IsOtherBusinessCommonFieldsRequired({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsOtherBusinessCommonFieldsRequired({ message: 'Website Link is required' })
  @IsString()
  websiteLink?: string;

  /***********
   * Fields for books *
   ***********/
  @IsOptional()
  @IsBookFieldsRequired({ message: 'Author is required' })
  @IsString()
  author?: string;

  @IsOptional()
  @IsBookFieldsRequired({ message: 'Page is required' })
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  @IsInt({ message: 'Number of pages is required' })
  pages?: number;

  @IsOptional()
  @IsBookFieldsRequired({ message: 'ISBN is required' })
  @IsString()
  isbn?: string;

  /***********
   * Fields for movies *
   ***********/
  @IsOptional()
  @IsMovieFieldsRequired({ message: 'Released Year is required' })
  yearReleased?: any;

  @IsOptional()
  @IsString()
  @IsMovieFieldsRequired({ message: 'Country of origin is required' })
  countryOfOrigin?: string;

  @IsOptional()
  @IsMovieFieldsRequired({ message: 'Duration is required' })
  durationInMinutes?: any;

  @IsOptional()
  @IsString()
  @IsMovieFieldsRequired({ message: 'Official Rating is required' })
  officialRatingReceived?: string;

  @IsOptional()
  @IsMovieFieldsRequired({ message: 'Trailer links are required' })
  trailerLinks?: string;

  @IsOptional()
  @IsMovieFieldsRequired({ message: 'Please add atleast one cast' })
  casts?: string;
}
