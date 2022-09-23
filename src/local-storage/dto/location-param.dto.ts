import { IsNotEmpty } from 'class-validator';

export class LocationParamDto {
  @IsNotEmpty()
  location: string;
}
