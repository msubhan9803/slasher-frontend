import { Type } from 'class-transformer';
import { IsNumber, Max, Min } from 'class-validator';

export class CreateOrUpdateGoreFactorRatingDto {
  @Type(() => Number)
  @IsNumber()
  @Max(5)
  @Min(1)
  goreFactorRating: number;
}
