import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { MAX_ALLOWED_UPLOAD_FILES_FOR_CHAT } from '../../constants';
import { ImageDescriptionsDto } from '../../feed-posts/dto/create-feed-post.dto';

export class SendMessageInConversationDto {
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  message?: string;

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : Array(value)))
  @ArrayMaxSize(MAX_ALLOWED_UPLOAD_FILES_FOR_CHAT, { message: `Only allow maximum of ${MAX_ALLOWED_UPLOAD_FILES_FOR_CHAT} description` })
  @Type(() => ImageDescriptionsDto)
  @ValidateNested({ each: true })
  imageDescriptions: ImageDescriptionsDto[];
}
