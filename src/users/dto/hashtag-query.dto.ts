import { Type } from 'class-transformer';
import {
 IsNotEmpty, IsNumber, IsOptional, IsString, Max,
} from 'class-validator';

export class HashtagQueryDto {
    @IsOptional()
    @IsString()
    query: string;

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
