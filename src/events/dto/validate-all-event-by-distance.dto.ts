import {
  IsString,
} from 'class-validator';

export class ValidateAllEventDistanceDto {
  @IsString()
  lattitude: string;

  @IsString()
  longitude: string;

  @IsString()
  maxDistanceMiles: number;
}
