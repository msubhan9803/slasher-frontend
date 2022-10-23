import { IsMongoId } from 'class-validator';

export class ParamUserIdDto {
  @IsMongoId()
  userId: string;
}
