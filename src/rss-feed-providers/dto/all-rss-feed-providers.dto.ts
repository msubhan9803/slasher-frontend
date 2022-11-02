import { Type } from 'class-transformer';
import {
  IsMongoId,
  IsNotEmpty, IsNumber, IsOptional, IsString, Max,
} from 'class-validator';

export class ValidateAllRssFeedProvidersDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Max(20)
  limit: number;

  @IsOptional()
  @IsString()
  @IsMongoId()
  after: string;
}
