import { Type } from 'class-transformer';
import {
  IsNotEmpty, IsNumber, IsOptional, Max,
} from 'class-validator';

export class LimitOffSetDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Max(20)
  limit: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  offset: number;
}
