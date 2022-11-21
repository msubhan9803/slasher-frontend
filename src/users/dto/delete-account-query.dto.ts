import { IsMongoId, IsNotEmpty } from 'class-validator';

export class DeleteAccountQueryDto {
  @IsNotEmpty()
  @IsMongoId()
  userId: string;
}
