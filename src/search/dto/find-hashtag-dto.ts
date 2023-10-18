import { Type } from 'class-transformer';
import {
  IsNotEmpty, IsNumber, IsOptional, IsString, Max,
} from 'class-validator';

export class FindHashtagDto {
  @IsNotEmpty()
  @IsString()
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
