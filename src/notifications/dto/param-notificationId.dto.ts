import { IsMongoId, IsNotEmpty } from 'class-validator';

export class ParamNotificationIdDto {
  @IsNotEmpty()
  @IsMongoId()
  id: string;
}
