import { Type } from 'class-transformer';
import {
 IsNumber, Max, Min, IsInt,
} from 'class-validator';

export class CreateOrUpdateRatingDto {
  @Type(() => Number)
  @IsNumber()
  @Max(5)
  @Min(1)
  @IsInt()
  rating: number;
}
