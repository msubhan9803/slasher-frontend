/* eslint-disable max-classes-per-file */
import { IsString } from 'class-validator';

export class AddMovieCast {
  @IsString()
  movieRef: string;

  @IsString({ message: 'Name is required' })
  name: string;

  @IsString({ message: 'Character Name is required' })
  characterName: string;
}
