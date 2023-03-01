import { Type } from 'class-transformer';
import {
  IsDefined,
  IsInt, IsNumber, Max, Min,
} from 'class-validator';

export class CreateOrUpdateGoreFactorRatingDto {
  @IsDefined()
  @Type(() => Number)
  @IsNumber()
  @Max(5)
  @Min(1)
  @IsInt()
  goreFactorRating: number;
}
