import { IsString } from 'class-validator';

export class ParamUserIdDto {
  @IsString()
  userId: string;
}
