import { Type } from 'class-transformer';
import {
  IsNotEmpty, IsNumber, IsOptional, Max, MaxLength,
} from 'class-validator';

export class GetFriendsDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Max(20)
  limit: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  offset: number;

  @IsOptional()
  @MaxLength(30)
  userNameContains: string;
}
