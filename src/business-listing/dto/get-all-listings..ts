import { IsNumber, IsOptional, IsString } from 'class-validator';

export class GetAllListingsDto {
  @IsOptional()
  @IsString()
  businesstype: string;

  @IsOptional()
  @IsString()
  after: string;

  @IsOptional()
  @IsNumber()
  limit: number;
}
