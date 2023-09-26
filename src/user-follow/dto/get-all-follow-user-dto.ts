import { Type } from 'class-transformer';
import {
 IsNotEmpty, IsNumber, IsOptional, Max,
} from 'class-validator';

export class FollowUserListDto {
    @IsNotEmpty()
    @Type(() => Number)
    @IsNumber()
    @Max(30)
    limit: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    offset: number;
}
