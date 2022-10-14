import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, Max } from 'class-validator';

export class SuggestUserNameQueryDto {
  @IsNotEmpty()
  query: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Max(20)
  limit: number;
}
