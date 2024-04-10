import { IsMongoId, IsNotEmpty } from 'class-validator';

export class BlockRecentMovieDto {
  @IsNotEmpty()
  @IsMongoId()
  movieId: string;
}
