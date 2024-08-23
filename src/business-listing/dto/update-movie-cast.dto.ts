/* eslint-disable max-classes-per-file */
import { IsString } from 'class-validator';

export class UpdateMovieCast {
  @IsString()
  movieRef: string;

  @IsString()
  castRef: string;

  @IsString({ message: 'Name is required' })
  name: string;

  @IsString({ message: 'Character Name is required' })
  characterName: string;
}
