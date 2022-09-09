import { IsEmail, IsNotEmpty } from 'class-validator';

export class ActivateAccountDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  verification_token: string;
}
