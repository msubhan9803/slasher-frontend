import { Type } from 'class-transformer';
import {
  IsEmail, IsIn, IsNotEmpty, IsNumber, IsOptional, MaxLength,
} from 'class-validator';
import { ProfileVisibility } from '../../schemas/user/user.enums';
import { IsValidUsername } from '../../app/decorators/class-validator/user-name.decorator';
import { IsValidFirstname } from '../../app/decorators/class-validator/first-name.decorator';

export class UpdateUserDto {
  @IsOptional()
  @IsNotEmpty()
  @IsValidFirstname()
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

  @IsOptional()
  @IsIn([ProfileVisibility.Public, ProfileVisibility.Private])
  @Type(() => Number)
  @IsNumber()
  profile_status: ProfileVisibility;
}
