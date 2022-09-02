import {
  IsNotEmpty,
  IsEmail,
  Length,
  MinLength,
  Matches,
} from 'class-validator';
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
  @Matches(
    /^(?=.*[A-Z])(?=.*[?!@#$%^&*()_+=,-])[a-zA-Z0-9?!@#$%^&*()-_+=,]{8,}$/,
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
