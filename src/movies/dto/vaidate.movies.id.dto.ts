import { IsMongoId, IsNotEmpty } from 'class-validator';

export class ValidateMovieIdDto {
  @IsMongoId()
  @IsNotEmpty()
  id: string;
}
