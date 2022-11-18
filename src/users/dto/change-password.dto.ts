import { IsNotEmpty } from 'class-validator';
import { Match } from '../../app/decorators/class-validator/match.decorator';
import { IsValidPassword } from '../../app/decorators/class-validator/valid-password.decorator';

export class ChangePasswordDto {
  @IsNotEmpty()
  currentPassword: string;

  @IsNotEmpty()
  @IsValidPassword()
  newPassword: string;

  @IsNotEmpty()
  @IsValidPassword()
  @Match('newPassword')
  newPasswordConfirmation: string;
}
