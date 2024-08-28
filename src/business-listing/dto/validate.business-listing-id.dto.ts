import { IsNotEmpty } from 'class-validator';

export class ValidateBusinessListingIdDto {
  @IsNotEmpty()
  id: string;
}
