import {
  IsEmail, IsOptional,
} from 'class-validator';
import { IsValidUsername } from '../../app/decorators/class-validator/user-name.decorator';

export class UpdateUserDto {
  @IsOptional()
  firstName: string;

  @IsOptional()
  @IsValidUsername()
  userName: string;

  @IsOptional()
  @IsEmail()
  email: string;
}
