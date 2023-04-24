import { Type } from 'class-transformer';
import {
  IsMongoId,
  IsOptional, MaxLength,
} from 'class-validator';
import { EventCategory } from '../../schemas/eventCategory/eventCategory.schema';
import { IsValidMongoDbLocation } from '../../app/decorators/class-validator/valid-location.decorator';
import { LocationType } from '../../types';

export class UpdateEventDto {
  @IsOptional()
  @MaxLength(150)
  name: string;

  @IsOptional()
  @IsMongoId({ message: 'Invalid event_type' })
  event_type: EventCategory;

  @IsOptional()
  @Type((typeOptions) => (typeOptions.object[typeOptions.property] === '' ? null : Date))
  startDate: Date;

  @IsOptional()
  @Type((typeOptions) => (typeOptions.object[typeOptions.property] === '' ? null : Date))
  endDate: Date;

  @IsOptional()
  @MaxLength(100)
  country: string;

  @IsOptional()
  @MaxLength(100)
  state: string;

  @IsOptional()
  @MaxLength(100)
  city: string;

  @IsOptional()
  @MaxLength(1000)
  event_info: string;

  @IsOptional()
  @MaxLength(300)
  url: string;

  @IsOptional()
  @MaxLength(100)
  author: string;

  @IsOptional()
  @MaxLength(150)
  address: string;

  @IsOptional()
  @IsValidMongoDbLocation()
  location: LocationType;
}
