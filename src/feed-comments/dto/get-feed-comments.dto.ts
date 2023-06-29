import { Type } from 'class-transformer';
import {
  IsIn,
  IsMongoId,
  IsNotEmpty, IsNumber, IsOptional, IsString, Max,
} from 'class-validator';
import { CommentsSortBy, CommentsSortByType } from '../../types';

export class GetFeedCommentsDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Max(20)
  limit: number;

  @IsString()
  @IsOptional()
  @IsMongoId()
  after: string;

  @IsNotEmpty()
  @IsMongoId()
  feedPostId: string;

  @IsNotEmpty()
  @IsIn(CommentsSortBy)
  @IsString()
  sortBy: CommentsSortByType;
}
