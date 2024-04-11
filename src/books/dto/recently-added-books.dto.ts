import { Type } from 'class-transformer';
import {
  IsIn,
  IsMongoId,
  IsNotEmpty, IsNumber, IsOptional, IsString, Matches, Max, MaxLength,
} from 'class-validator';

export class RecentlyAddedBooksDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Max(60)
  limit: number;

  @IsOptional()
  @IsIn(['name', 'publishDate', 'rating'])
  @IsString()
  sortBy: 'name' | 'publishDate' | 'rating';

  @IsOptional()
  @IsString()
  @IsMongoId()
  after: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  nameContains: string;

  @IsOptional()
  movieIdsIn: string;

  @IsOptional()
  @Matches(/^[a-z0-9#]+$/)
  startsWith: string;
}
