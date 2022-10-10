import { Type } from 'class-transformer';
import {
 IsNotEmpty, IsNumber, IsOptional, IsString,
} from 'class-validator';

export class LimitOrEarlierThanPostIdDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  limit: number;

  @IsString()
  @IsOptional()
  earlierThanPostId: string;
}
