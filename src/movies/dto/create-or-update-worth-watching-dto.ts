import { Type } from 'class-transformer';
import {
 IsNumber, Max, Min, IsInt, IsDefined,
} from 'class-validator';

export class CreateOrUpdateWorthWatchingDto {
  @IsDefined()
  @Type(() => Number)
  @IsNumber()
  @Max(2)
  @Min(1)
  @IsInt()
  worthWatching: number;
}
