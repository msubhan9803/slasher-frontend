import { IsNotEmpty, IsEmail } from 'class-validator';

export class ValidatePasswordResetTokenDto {
  @IsNotEmpty()
  @IsEmail(
    {},
    {
      message: 'Not a valid-format email address.',
    },
  )
  email: string;

  @IsNotEmpty()
  resetPasswordToken: string;
}
