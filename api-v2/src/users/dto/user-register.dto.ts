import {
  IsNotEmpty,
  IsEmail,
  MinLength,
  Matches,
} from 'class-validator';
import { IsValidUsername } from '../../app/decorators/class-validator/user-name.decorator';
import { Match } from '../../app/decorators/class-validator/match.decorator';

export class UserRegisterDto {
  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  @IsValidUsername()
  userName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Matches(
    /^(?=.*[A-Z])(?=.*[?!@#$%^&*()_+=,-])[a-zA-Z0-9?!@#$%^&*()-_+=,]{8,}$/,
    {
      message:
        'Password must at least 8 characters long, contain at least one (1) capital letter, '
        + 'and contain at least one (1) special character.',
    },
  )
  password: string;

  @IsNotEmpty()
  @Match('password')
  passwordConfirmation: string;

  @IsNotEmpty()
  @MinLength(10)
  securityQuestion: string;

  @IsNotEmpty()
  @MinLength(5)
  securityAnswer: string;
}
