import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, Max } from 'class-validator';

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
}
