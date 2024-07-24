import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ListingName } from 'src/schemas/businessListingType/businessListingType.enums';

export class CreateBusinessListingTypeDto {
  @IsEnum(ListingName, { message: 'Invalid listing name' })
  @IsNotEmpty({ message: 'Name is required' })
  name: ListingName;

  @IsNotEmpty({ message: 'Label is required' })
  @IsString()
  @MaxLength(100, { message: 'Label must be less than 100 characters' })
  label: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true, message: 'Each feature must be a string' })
  features?: string[];

  @IsNotEmpty({ message: 'Price is required' })
  @IsNumber()
  price: number;
}
