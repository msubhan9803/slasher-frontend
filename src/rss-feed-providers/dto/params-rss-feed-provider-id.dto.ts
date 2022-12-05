import { IsMongoId, IsNotEmpty } from 'class-validator';

export class ParamRssFeedProviderIdDto {
  @IsNotEmpty()
  @IsMongoId()
  id: string;
}
