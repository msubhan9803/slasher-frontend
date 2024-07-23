/* eslint-disable max-classes-per-file */
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import mongoose from 'mongoose';
import { BusinessType } from 'src/schemas/businessListing/businessListing.enums';

class CastDto {
  @IsNotEmpty({ message: 'Cast image URL is required' })
  @IsString()
  castImage: string;

  @IsNotEmpty({ message: 'Cast name is required' })
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  characterName: string;
}

class TrailerLinksDto {
  @IsNotEmpty({ message: 'Main trailer link is required' })
  @IsString()
  main: string;

  @IsOptional()
  @IsString()
  trailer2: string;

  @IsOptional()
  @IsString()
  trailer3: string;
}

export class CreateBusinessListingDto {
  @IsOptional()
  @IsMongoId()
  readonly _id?: mongoose.Schema.Types.ObjectId;

  @IsEnum(BusinessType, { message: 'Invalid business type' })
  businesstype: BusinessType;

  @IsOptional()
  @IsString()
  image?: string;

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

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Author name must be less than 100 characters' })
  author?: string;

  @IsOptional()
  @IsNumber()
  pages?: number;

  @IsOptional()
  @IsString()
  @MaxLength(20, { message: 'ISBN must be less than 20 characters' })
  isbn?: string;

  @IsOptional()
  @IsNumber()
  yearReleased?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Country of origin must be less than 100 characters' })
  countryOfOrigin?: string;

  @IsOptional()
  @IsNumber()
  durationInMinutes?: number;

  @IsOptional()
  @IsString()
  @MaxLength(10, { message: 'Official rating received must be less than 10 characters' })
  officialRatingReceived?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => TrailerLinksDto)
  trailerLinks?: TrailerLinksDto;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one cast member is required' })
  @ValidateNested({ each: true })
  @Type(() => CastDto)
  casts?: CastDto[];
}
