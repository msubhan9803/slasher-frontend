import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';
import { IsValidYear } from '../../app/decorators/class-validator/min-or-max-year.decorator';

export class ReleaseYearDto {
  @Type(() => Number)
  @IsNumber()
  @IsValidYear()
  year: number;
}
