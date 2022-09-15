import { IsEmail, IsNotEmpty } from 'class-validator';
import { IsValidPassword } from '../../app/decorators/class-validator/valid-password.decorator';
import { Match } from '../../app/decorators/class-validator/match.decorator';

export class ResetPasswordDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  resetPasswordToken: string;

  @IsNotEmpty()
  @IsValidPassword()
  newPassword: string;

  @IsNotEmpty()
  @Match('newPassword')
  newPasswordConfirmation: string;
}
