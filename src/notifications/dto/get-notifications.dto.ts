import { Type } from 'class-transformer';
import {
  IsMongoId,
  IsNotEmpty, IsNumber, IsOptional, IsString, Max,
} from 'class-validator';

export class GetNotificationsDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Max(20)
  limit: number;

  @IsString()
  @IsOptional()
  @IsMongoId()
  before: string;
}
