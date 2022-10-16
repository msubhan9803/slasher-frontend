import { Type } from 'class-transformer';
import {
  IsMongoId,
  IsOptional, MaxLength,
} from 'class-validator';
import { Schema } from 'mongoose';
import { EventCategory } from '../../schemas/eventCategory/eventCategory.schema';

export class CreateOrUpdateEventDto {
  @IsOptional()
  @MaxLength(150)
  name: string;

  @IsOptional()
  @IsMongoId()
  userId: Schema.Types.ObjectId;

  @IsOptional()
  @IsMongoId()
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
}
