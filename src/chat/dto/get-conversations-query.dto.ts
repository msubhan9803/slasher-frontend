import { Type } from 'class-transformer';
import {
  IsNotEmpty, IsNumber, IsString, IsMongoId, IsOptional, Max,
} from 'class-validator';

export class GetConversationsQueryDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Max(30)
  limit: number;

  @IsString()
  @IsOptional()
  @IsMongoId()
  before: string;
}
