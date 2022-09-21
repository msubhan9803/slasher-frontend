import { IsNotEmpty } from 'class-validator';

export class LocationQueryDto {
  @IsNotEmpty()
  location: string;
}
