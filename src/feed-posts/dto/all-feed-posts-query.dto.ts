import { Type } from 'class-transformer';
import {
  IsNotEmpty, IsNumber, IsOptional, IsString,
} from 'class-validator';

export class AllFeedPostQueryDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  limit: number;

  @IsString()
  @IsOptional()
  before: string;
}
