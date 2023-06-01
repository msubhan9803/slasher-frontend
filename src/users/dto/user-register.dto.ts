import {
  IsNotEmpty,
  IsEmail,
  MinLength,
  IsISO8601,
} from 'class-validator';
import { IsValidUsername } from '../../app/decorators/class-validator/user-name.decorator';
import { IsValidPassword } from '../../app/decorators/class-validator/valid-password.decorator';
import { Match } from '../../app/decorators/class-validator/match.decorator';
import { MinYearsBeforeToday } from '../../app/decorators/class-validator/min-years-before-today.decorator';
import { IsValidFirstname } from '../../app/decorators/class-validator/first-name.decorator';

export class UserRegisterDto {
  @IsNotEmpty()
  @IsValidFirstname()
  firstName: string;

  @IsNotEmpty()
  @IsValidUsername()
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
  @MinLength(2)
  securityAnswer: string;

  @IsNotEmpty()
  @MinYearsBeforeToday(18, { message: 'You must be at least 18 to register' })
  @IsISO8601({ strict: true }, { message: 'Invalid date of birth' })
  dob: Date;
}
