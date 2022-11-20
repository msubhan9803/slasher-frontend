import { Type } from 'class-transformer';
import {
  IsNotEmpty, IsNumber, IsString, IsMongoId, IsOptional,
} from 'class-validator';

export class GetConversationsQueryDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  limit: number;

  @IsString()
  @IsOptional()
  @IsMongoId()
  before: string;
}
