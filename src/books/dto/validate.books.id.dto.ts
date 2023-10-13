import { IsNotEmpty } from 'class-validator';

export class ValidateBookIdDto {
  @IsNotEmpty()
  id: string;
}
