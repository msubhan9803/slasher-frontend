import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class NotificationDto {
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === true)
  notification: boolean;
}
