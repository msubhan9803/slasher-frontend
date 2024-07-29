/* eslint-disable max-classes-per-file */
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import mongoose from 'mongoose';
import { BusinessType } from 'src/schemas/businessListing/businessListing.enums';

export class CreateBusinessListingDto {
  @IsEnum(BusinessType, { message: 'Invalid business type' })
  businesstype: BusinessType;

  @IsString()
  listingType: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty({ message: 'Title is required' })
  @IsString()
  @MaxLength(100, { message: 'Title must be less than 100 characters' })
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Overview must be less than 500 characters' })
  overview?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Link must be less than 200 characters' })
  link?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  /***********
   * Fields for books *
   ***********/
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Author name must be less than 100 characters' })
  author?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  @IsInt({ message: 'Pages must be an integer' })
  pages?: number;

  @IsOptional()
  @IsString()
  @MaxLength(20, { message: 'ISBN must be less than 20 characters' })
  isbn?: string;

  /***********
   * Fields for movies *
   ***********/
  @IsOptional()
  yearReleased?: any;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Country of origin must be less than 100 characters' })
  countryOfOrigin?: string;

  @IsOptional()
  durationInMinutes?: any;

  @IsOptional()
  @IsString()
  @MaxLength(10, { message: 'Official rating received must be less than 10 characters' })
  officialRatingReceived?: string;

  @IsOptional()
  trailerLinks?: string;

  @IsOptional()
  casts?: string;
}
