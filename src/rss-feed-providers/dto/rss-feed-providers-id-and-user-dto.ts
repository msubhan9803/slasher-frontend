import { IsMongoId, IsNotEmpty } from 'class-validator';

export class RssFeedProvidersIdAndUserDto {
  @IsNotEmpty()
  @IsMongoId()
  id: string;

  @IsNotEmpty()
  @IsMongoId()
  userId: string;
}
