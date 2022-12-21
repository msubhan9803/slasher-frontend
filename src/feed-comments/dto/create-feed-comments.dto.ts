import {
  IsMongoId, IsNotEmpty, IsOptional, MaxLength,
} from 'class-validator';
import { Image } from 'src/schemas/shared/image.schema';

export class CreateFeedCommentsDto {
  @IsNotEmpty()
  @MaxLength(8000, { message: 'message cannot be longer than 8,000 characters' })
  message?: string;

  @IsNotEmpty()
  @IsMongoId()
  feedPostId: string;

  @IsOptional()
  images: Image[];
}
