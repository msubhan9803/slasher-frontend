import { IsNotEmpty } from 'class-validator';

export class ParamNotificationIdDto {
  @IsNotEmpty()
  id: string;
}
