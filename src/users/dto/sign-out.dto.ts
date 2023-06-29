import { IsNotEmpty } from 'class-validator';

export class SignOutDto {
  @IsNotEmpty()
  device_id: string;
}
