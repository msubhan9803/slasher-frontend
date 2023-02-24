import { Type } from 'class-transformer';
import {
 IsNumber, Max, Min, IsInt,
} from 'class-validator';

export class CreateOrUpdateWorthWatchingDto {
  @Type(() => Number)
  @IsNumber()
  @Max(2)
  @Min(1)
  @IsInt()
  worthWatching: number;
}
