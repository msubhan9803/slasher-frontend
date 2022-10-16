import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';
import { IsValidMovieYear } from '../../app/decorators/class-validator/is-valid-movie-year.decorator';

export class ReleaseYearDto {
  @Type(() => Number)
  @IsNumber()
  @IsValidMovieYear()
  year: number;
}
