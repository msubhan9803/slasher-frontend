import { Type } from 'class-transformer';
import {
  IsNotEmpty, IsNumber, IsString, IsMongoId, IsOptional, Max,
} from 'class-validator';

export class GetConversationsQueryDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Max(20)
  limit: number;

  @IsString()
  @IsOptional()
  @IsMongoId()
  before: string;
}
