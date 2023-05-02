import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, Max } from "class-validator";

export class HashtagQueryDto{
    @IsNotEmpty()
    @Type(() => Number)
    @IsNumber()
    @Max(30)
    limit: number;
  
    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    offset: number;
}