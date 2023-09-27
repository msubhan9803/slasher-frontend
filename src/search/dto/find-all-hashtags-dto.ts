import { Type } from 'class-transformer';
import {
  IsIn,
  IsMongoId,
  IsNotEmpty, IsNumber, IsOptional, IsString, Matches, Max, MaxLength,
} from 'class-validator';
import { HashtagsSortBy, HashtagsSortByType } from '../../types';

export class FindAllHashtagsDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Max(60)
  limit: number;

  @IsNotEmpty()
  @IsIn(HashtagsSortBy)
  @IsString()
  sortBy: HashtagsSortByType;

  @IsOptional()
  @IsString()
  @IsMongoId()
  after: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  nameContains: string;

  @IsOptional()
  @Matches(/^[a-z0-9#]+$/)
  startsWith: string;
}
