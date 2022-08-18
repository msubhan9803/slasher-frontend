import { IsNotEmpty } from 'class-validator';

export class UserLoginDto {
  @IsNotEmpty()
  emailOrUsername: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  device_id: string;

  @IsNotEmpty()
  device_token: string;

  @IsNotEmpty()
  device_type: string;

  @IsNotEmpty()
  app_version: string;

  @IsNotEmpty()
  device_version: string;
}
