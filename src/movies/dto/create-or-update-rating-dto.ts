import { Type } from 'class-transformer';
import {
 IsNumber, Max, Min, IsInt, IsDefined,
} from 'class-validator';

export class CreateOrUpdateRatingDto {
  @IsDefined()
  @Type(() => Number)
  @IsNumber()
  @Max(5)
  @Min(1)
  @IsInt()
  rating: number;
}
