import {
 IsNotEmpty, IsNumberString, IsOptional, IsString,
} from 'class-validator';

export class LimitOrEarlierThanPostIdDto {
  @IsNumberString()
  @IsNotEmpty()
  limit: number;

  @IsString()
  @IsOptional()
  earlierThanPostId: string;
}
