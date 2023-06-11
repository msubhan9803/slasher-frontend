import { IsNotEmpty } from 'class-validator';

export class UpdateDeviceTokenDto {
  @IsNotEmpty()
  device_id: string;

  @IsNotEmpty()
  device_token: string;
}
