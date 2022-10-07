import { Type } from 'class-transformer';
import {
 IsNotEmpty, IsNumber, IsOptional, IsString, Matches,
} from 'class-validator';
import { SIMPLE_MONGODB_ID_REGEX } from '../../constants';

export class FindAllMoviesDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  limit: number;

  @IsNotEmpty()
  sortBy: string;

  @IsOptional()
  @IsString()
  @Matches(SIMPLE_MONGODB_ID_REGEX)
  after: string;
}
