import { Type } from 'class-transformer';
import {
  IsOptional, MaxLength, ValidateNested,
} from 'class-validator';
import { ImagesDto } from './images.dto';

export class CreateOrUpdateFeedPostDto {
  @IsOptional()
  @MaxLength(1000, { message: 'message cannot be longer than 1000 characters' })
  message?: string;

  @Type(() => ImagesDto)
  @ValidateNested()
  images: ImagesDto[];

}
