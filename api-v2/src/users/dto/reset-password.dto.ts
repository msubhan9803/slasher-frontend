import { IsEmail, IsNotEmpty, Matches } from 'class-validator';
import { Match } from '../../app/decorators/class-validator/match.decorator';

export class ResetPasswordDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  resetPasswordToken: string;

  @IsNotEmpty()
  @Matches(
    /^(?=.*[A-Z])(?=.*[?!@#$%^&*()_+=,-])[a-zA-Z0-9?!@#$%^&*()-_+=,]{8,}$/,
    {
      message:
        'newPassword must at least 8 characters long, contain at least one (1) capital letter, and contain at least one (1) special character.',
    },
  )
  newPassword: string;

  @IsNotEmpty()
  @Match('newPassword')
  newPasswordConfirmation: string;
}
