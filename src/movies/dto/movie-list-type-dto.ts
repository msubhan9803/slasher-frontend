import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { MovieListType, movieList } from '../../types';

export class MovieListTypeDto {
  @IsNotEmpty()
  @IsIn(movieList)
  @IsString()
  type: MovieListType;
}
