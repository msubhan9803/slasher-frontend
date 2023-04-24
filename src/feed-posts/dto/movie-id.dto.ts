import { IsMongoId, IsNotEmpty } from 'class-validator';

export class MovieIdDto {
  @IsNotEmpty()
  @IsMongoId()
  movieId: string;
}
