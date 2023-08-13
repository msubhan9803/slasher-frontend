import { IsMongoId, IsNotEmpty } from 'class-validator';

export class RssFeedProvidersIdDto {
  @IsMongoId()
  @IsNotEmpty()
  id: string;
}
