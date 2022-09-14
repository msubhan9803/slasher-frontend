import { IsNotEmpty, Length } from 'class-validator';

export class CheckUserNameQueryDto {
  @IsNotEmpty()
  @Length(0, 30)
  userName: string;
}
