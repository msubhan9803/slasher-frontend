import { Type } from 'class-transformer';
import {
  IsNotEmpty,
} from 'class-validator';

export class ValidateAllEventCountsDto {
  @IsNotEmpty()
  @Type((typeOptions) => (typeOptions.object[typeOptions.property] === '' ? null : Date))
  startDate: Date;

  @IsNotEmpty()
  @Type((typeOptions) => (typeOptions.object[typeOptions.property] === '' ? null : Date))
  endDate: Date;
}
