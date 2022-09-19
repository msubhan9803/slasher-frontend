import { IsEmail, IsNotEmpty } from 'class-validator';

export class ActivateAccountDto {
  @IsNotEmpty()
  @IsEmail({}, { message: 'email must be a valid-format email' })
  email: string;

  @IsNotEmpty()
  verification_token: string;
}
