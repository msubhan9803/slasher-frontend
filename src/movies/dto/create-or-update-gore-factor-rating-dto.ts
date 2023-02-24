import { Type } from 'class-transformer';
import {
  IsInt, IsNumber, Max, Min,
} from 'class-validator';

export class CreateOrUpdateGoreFactorRatingDto {
  @Type(() => Number)
  @IsNumber()
  @Max(5)
  @Min(1)
  @IsInt()
  goreFactorRating: number;
}
