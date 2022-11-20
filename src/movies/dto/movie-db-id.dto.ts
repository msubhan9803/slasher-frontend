import { Type } from 'class-transformer';
import {
  IsNotEmpty, IsNumber,
} from 'class-validator';

export class ValidateMovieDbIdDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  movieDBId: number;
}
