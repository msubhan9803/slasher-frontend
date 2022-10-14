import { IsNotEmpty } from 'class-validator';

export class ValidateMovieIdDto {
  @IsNotEmpty()
  id: string;
}
