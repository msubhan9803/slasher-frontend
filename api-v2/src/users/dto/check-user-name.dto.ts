import { IsNotEmpty, Length } from 'class-validator';

export class CheckUserNameDto {
  @IsNotEmpty()
  @Length(0, 30)
  userName: string;
}
