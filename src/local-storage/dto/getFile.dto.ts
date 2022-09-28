import { IsNotEmpty } from 'class-validator';

export class GetFileDto {
  @IsNotEmpty()
  location: string;
}
