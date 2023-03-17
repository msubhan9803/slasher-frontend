import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
} from 'class-validator';

export class ValidateAllEventsByRectangularAreaDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  latitudeTopRight: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  longitudeTopRight: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  latitudeBottomLeft: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  longitudeBottomLeft: number;
}
