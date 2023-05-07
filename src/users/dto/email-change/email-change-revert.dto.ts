import { IsMongoId, IsNotEmpty } from 'class-validator';

export class EmailChangeRevertDto {
  @IsNotEmpty()
  @IsMongoId()
  userId: string;

  @IsNotEmpty()
  token: string;
}
