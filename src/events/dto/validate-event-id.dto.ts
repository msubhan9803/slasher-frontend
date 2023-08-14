import { IsMongoId, IsNotEmpty } from 'class-validator';

export class ValidateEventIdDto {
  @IsNotEmpty()
  @IsMongoId()
  id: string;
}
