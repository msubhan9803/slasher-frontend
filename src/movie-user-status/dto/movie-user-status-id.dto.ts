import { IsMongoId, IsNotEmpty } from 'class-validator';

export class MovieUserStatusIdDto {
  @IsNotEmpty()
  @IsMongoId()
  movieId: string;
}
