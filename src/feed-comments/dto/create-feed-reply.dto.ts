import { Transform, TransformFnParams } from 'class-transformer';
import {
  ArrayMaxSize,
  IsMongoId, IsNotEmpty, IsOptional, IsString, MaxLength,
} from 'class-validator';
import mongoose from 'mongoose';
import { MAX_ALLOWED_UPLOAD_FILES_FOR_COMMENT } from '../../constants';

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
  @ArrayMaxSize(MAX_ALLOWED_UPLOAD_FILES_FOR_COMMENT)
  @MaxLength(250, { each: true }) // set maximum length of each string inside the array
  @IsString({ each: true })
  imageDescriptions: string[];
}
