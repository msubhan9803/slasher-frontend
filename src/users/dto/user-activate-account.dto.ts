import { IsMongoId, IsNotEmpty } from 'class-validator';

export class ActivateAccountDto {
  @IsNotEmpty()
  @IsMongoId()
  userId: string;

  @IsNotEmpty()
  token: string;
}
