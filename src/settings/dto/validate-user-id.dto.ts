import { IsNotEmpty } from 'class-validator';

export class ValidateUserIdDto {
  @IsNotEmpty()
  userId: string;
}
