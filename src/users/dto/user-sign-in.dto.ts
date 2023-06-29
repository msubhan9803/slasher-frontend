import { IsNotEmpty, IsOptional } from 'class-validator';

export class UserSignInDto {
  @IsNotEmpty()
  emailOrUsername: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  device_id: string;

  @IsOptional()
  device_token?: string;

  @IsNotEmpty()
  device_type: string;

  @IsNotEmpty()
  app_version: string;

  @IsNotEmpty()
  device_version: string;
}
