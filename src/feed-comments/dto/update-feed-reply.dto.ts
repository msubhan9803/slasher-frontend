import { Transform, TransformFnParams } from 'class-transformer';
import {
 ArrayMaxSize, IsOptional, IsString, MaxLength,
} from 'class-validator';
import { MAX_ALLOWED_UPLOAD_FILES_FOR_COMMENT } from '../../constants';

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
  @ArrayMaxSize(MAX_ALLOWED_UPLOAD_FILES_FOR_COMMENT)
  @MaxLength(250, { each: true }) // set maximum length of each string inside the array
  @IsString({ each: true })
  imageDescriptions: string[];
}
