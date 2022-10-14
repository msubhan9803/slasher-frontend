import { Type } from 'class-transformer';
import {
  IsNotEmpty, IsNumber, IsOptional, IsString, Matches, Max,
} from 'class-validator';
import { SIMPLE_MONGODB_ID_REGEX } from '../../constants';

export class ValidateAllEventDto {
  @IsNotEmpty()
  @Type((typeOptions) => (typeOptions.object[typeOptions.property] === '' ? null : Date))
  startDate: Date;

  @IsNotEmpty()
  @Type((typeOptions) => (typeOptions.object[typeOptions.property] === '' ? null : Date))
  endDate: Date;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Max(20)
  limit: number;

  @IsOptional()
  @IsString()
  @Matches(SIMPLE_MONGODB_ID_REGEX)
  after: string;
}
