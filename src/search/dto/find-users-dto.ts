import { Type } from 'class-transformer';
import {
  IsNotEmpty, IsNumber, IsOptional, IsString, Max, MaxLength, MinLength,
} from 'class-validator';

export class FindUsersDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  query: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Max(30)
  limit: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  offset: number;
}
