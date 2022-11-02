import { Type } from 'class-transformer';
import {
  IsMongoId,
  IsNotEmpty, IsNumber, IsOptional, IsString,
} from 'class-validator';

export class MainFeedPostQueryDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  limit: number;

  @IsString()
  @IsOptional()
  @IsMongoId()
  before: string;
}
