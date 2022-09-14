import {
  IsNotEmpty,
  IsEmail,
  Length,
  MinLength,
} from 'class-validator';
import { IsValidPassword } from '../../app/decorators/class-validator/valid-password.decorator';
import { Match } from '../../app/decorators/class-validator/match.decorator';

export class UserRegisterDto {
  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  @Length(0, 30)
  userName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsValidPassword()
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
