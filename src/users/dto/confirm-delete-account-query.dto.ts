import { IsMongoId, IsNotEmpty } from 'class-validator';

export class ConfirmDeleteAccountQueryDto {
  @IsNotEmpty()
  @IsMongoId()
  confirmUserId: string;
}
