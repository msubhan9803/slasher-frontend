import { IsNotEmpty } from 'class-validator';

export class RssFeedProvidersIdDto {
  @IsNotEmpty()
  id: string;
}
