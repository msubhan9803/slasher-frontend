import { Type } from 'class-transformer';
import {
  IsMongoId,
  IsNotEmpty, IsNumber, IsOptional, IsString, Max,
} from 'class-validator';

export class GetFeedCommentsDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Max(30)
  limit: number;

  @IsString()
  @IsOptional()
  @IsMongoId()
  before: string;

  @IsNotEmpty()
  @IsMongoId()
  feedPostId: string;
}
