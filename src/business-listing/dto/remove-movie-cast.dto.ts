import { IsNotEmpty } from 'class-validator';

export class RemoveMovieCast {
  @IsNotEmpty()
  movieRef: string;

  @IsNotEmpty()
  castRef: string;
}
