import { Type } from 'class-transformer';
import {
  IsIn,
  IsMongoId,
  IsNumber, IsOptional, IsString, Matches, Max, MaxLength,
} from 'class-validator';

export class FindAllBooksDto {
  @IsOptional()
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
  bookIdsIn: string;

  @IsOptional()
  @Matches(/^[a-z0-9#]+$/)
  startsWith: string;
}
