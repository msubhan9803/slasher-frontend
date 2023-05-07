import { IsMongoId, IsNotEmpty } from 'class-validator';

export class EmailChangeConfirmDto {
  @IsNotEmpty()
  @IsMongoId()
  userId: string;

  @IsNotEmpty()
  token: string;
}
