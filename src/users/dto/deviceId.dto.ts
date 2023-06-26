import { IsNotEmpty } from 'class-validator';

export class DeviceIdDto {
  @IsNotEmpty()
  device_id: string;
}
