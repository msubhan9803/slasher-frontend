import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @IsNotEmpty()
  @IsEmail(
    {},
    {
      message: 'Not a valid-format email address.',
    },
  )
  email: string;
}
