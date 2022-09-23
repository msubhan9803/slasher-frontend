import {
  IsEmail, IsOptional, MaxLength,
} from 'class-validator';
import { IsValidUsername } from '../../app/decorators/class-validator/user-name.decorator';

export class UpdateUserDto {
  @IsOptional()
  firstName?: string;

  @IsOptional()
  @IsValidUsername()
  userName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @MaxLength(1000, { message: 'About Me cannot be longer than 1000 characters' })
  aboutMe?: string;
}
