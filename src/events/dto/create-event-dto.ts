import { Type } from 'class-transformer';
import {
  IsMongoId,
  IsNotEmpty,
  IsOptional, MaxLength,
} from 'class-validator';
import { EventCategory } from '../../schemas/eventCategory/eventCategory.schema';

export class CreateEventDto {
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @IsNotEmpty()
  @IsMongoId({ message: 'Invalid event_type' })
  event_type: EventCategory;

  @IsNotEmpty()
  @Type((typeOptions) => (typeOptions.object[typeOptions.property] === '' ? null : Date))
  startDate: Date;

  @IsNotEmpty()
  @Type((typeOptions) => (typeOptions.object[typeOptions.property] === '' ? null : Date))
  endDate: Date;

  @IsNotEmpty()
  @MaxLength(100)
  country: string;

  @IsNotEmpty()
  @MaxLength(100)
  state: string;

  @IsNotEmpty()
  @MaxLength(100)
  city: string;

  @IsNotEmpty()
  @MaxLength(1000)
  event_info: string;

  @IsOptional()
  @MaxLength(300)
  url: string;

  @IsOptional()
  @MaxLength(100)
  author: string;

  @IsNotEmpty()
  @MaxLength(150)
  address: string;
}
