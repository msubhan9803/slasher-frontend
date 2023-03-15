import { Type } from 'class-transformer';
import {
  IsNotEmpty, IsNumber, IsString, Max,
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
}
