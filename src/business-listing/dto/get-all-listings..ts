import { IsOptional, IsString } from 'class-validator';

export class GetAllListingsDto {
  @IsOptional()
  @IsString()
  businesstype: string;
}
