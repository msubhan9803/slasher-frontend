import { IsNotEmpty } from 'class-validator';
import { IsValidUsername } from '../../app/decorators/class-validator/user-name.decorator';

export class CheckUserNameQueryDto {
  @IsNotEmpty()
  @IsValidUsername()
  userName: string;
}
