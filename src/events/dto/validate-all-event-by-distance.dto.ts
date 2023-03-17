import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
} from 'class-validator';

export class ValidateAllEventDistanceDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  latitude: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  longitude: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  maxDistanceMiles: number;
}
