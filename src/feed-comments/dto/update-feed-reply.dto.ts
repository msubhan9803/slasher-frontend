import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
 ArrayMaxSize, IsOptional, MaxLength, ValidateNested,
} from 'class-validator';
import { MAX_ALLOWED_UPLOAD_FILES_FOR_COMMENT } from '../../constants';
import { UpdateImageDescriptionsDto } from '../../feed-posts/dto/update-feed-posts.dto';

export class UpdateFeedReplyDto {
  @IsOptional()
  @MaxLength(8000, { message: 'message cannot be longer than 8,000 characters' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  message?: string;

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : Array(value)))
  imagesToDelete?: string[];

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : Array(value)))
  @ArrayMaxSize(MAX_ALLOWED_UPLOAD_FILES_FOR_COMMENT, {
    message: `Only allow maximum of ${MAX_ALLOWED_UPLOAD_FILES_FOR_COMMENT} description`,
  })
  @Type(() => UpdateImageDescriptionsDto)
  @ValidateNested({ each: true })
  imageDescriptions: UpdateImageDescriptionsDto[];
}
