import { Type } from 'class-transformer';
import { IsNumber, Max, Min } from 'class-validator';

export class CreateOrUpdateWorthWatchingDto {
  @Type(() => Number)
  @IsNumber()
  @Max(2)
  @Min(1)
  worthWatching: number;
}
