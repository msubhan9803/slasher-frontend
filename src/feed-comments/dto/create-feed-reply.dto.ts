import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsMongoId, IsNotEmpty, IsOptional, MaxLength, ValidateNested,
} from 'class-validator';
import mongoose from 'mongoose';
import { MAX_ALLOWED_UPLOAD_FILES_FOR_COMMENT } from '../../constants';
import { ImageDescriptionsDto } from '../../feed-posts/dto/create-feed-post.dto';

export class CreateFeedReplyDto {
  @IsOptional()
  @MaxLength(8000, { message: 'message cannot be longer than 8,000 characters' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  message?: string;

  @IsNotEmpty()
  @IsMongoId()
  feedCommentId: mongoose.Schema.Types.ObjectId;

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : Array(value)))
  @ArrayMaxSize(MAX_ALLOWED_UPLOAD_FILES_FOR_COMMENT, {
    message: `Only allow maximum of ${MAX_ALLOWED_UPLOAD_FILES_FOR_COMMENT} description`,
  })
  @Type(() => ImageDescriptionsDto)
  @ValidateNested({ each: true })
  imageDescriptions: ImageDescriptionsDto[];
}
