import { IsOptional, IsString } from 'class-validator';

export class GetAllMyListingsDto {
  @IsOptional()
  @IsString()
  search?: string;
}
