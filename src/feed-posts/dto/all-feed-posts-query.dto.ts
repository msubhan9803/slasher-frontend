import { Type } from 'class-transformer';
import {
  IsNotEmpty, IsNumber, IsOptional, IsString, Matches,
} from 'class-validator';
import { SIMPLE_MONGODB_ID_REGEX } from '../../constants';

export class AllFeedPostQueryDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  limit: number;

  @IsString()
  @IsOptional()
  @Matches(SIMPLE_MONGODB_ID_REGEX)
  before: string;
}
