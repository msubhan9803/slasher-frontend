import { IsMongoId, IsString } from 'class-validator';

export class UpdateHashtagStatusParamDto {
  @IsMongoId()
  @IsString()
  id: string;
}
