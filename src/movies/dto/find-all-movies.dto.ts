import { Type } from 'class-transformer';
import {
  IsIn,
  IsMongoId,
  IsNotEmpty, IsNumber, IsOptional, IsString, Max,
} from 'class-validator';

export class FindAllMoviesDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Max(20)
  limit: number;

  @IsNotEmpty()
  @IsIn(['name', 'releaseDate'])
  @IsString()
  sortBy: 'name' | 'releaseDate';

  @IsOptional()
  @IsString()
  @IsMongoId()
  after: string;
}
