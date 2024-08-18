/* eslint-disable max-classes-per-file */
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { BusinessType } from 'src/schemas/businessListing/businessListing.enums';
import { IsOtherBusinessCommonFieldsRequired } from '../decorators/is-other-business-common-fields-required.decorator';

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

export class UpdateBusinessListingDto {
  @IsString()
  readonly _id: string;

  @IsOptional()
  @IsEnum(BusinessType, { message: 'Invalid business type' })
  businesstype: BusinessType;

  @IsOptional()
  @IsString()
  bookRef?: string;

  @IsOptional()
  @IsString()
  movieRef?: string;

  @IsOptional()
  @IsNotEmpty({ message: 'Title is required' })
  @IsString()
  @MaxLength(100, { message: 'Title must be less than 100 characters' })
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(1010, { message: 'Overview must be less than 500 characters' })
  overview: string;

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
  @IsNumber({}, { message: 'Year released must be number' })
  yearReleased?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Country of origin must be less than 100 characters' })
  countryOfOrigin?: string;

  @IsOptional()
  @IsNumber()
  durationInMinutes?: number;

  @IsOptional()
  @IsNumber()
  officialRatingReceived?: number;

  @IsOptional()
  trailerLinks?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one cast member is required' })
  @ValidateNested({ each: true })
  @Type(() => CastDto)
  casts?: CastDto[];

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
}
