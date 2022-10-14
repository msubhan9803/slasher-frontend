import { IsNotEmpty } from 'class-validator';

export class ValidateEventIdDto {
  @IsNotEmpty()
  id: string;
}
