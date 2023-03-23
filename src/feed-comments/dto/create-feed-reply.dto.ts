import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsMongoId, IsNotEmpty, IsOptional, MaxLength,
} from 'class-validator';
import mongoose from 'mongoose';

export class CreateFeedReplyDto {
  @IsOptional()
  @MaxLength(8000, { message: 'message cannot be longer than 8,000 characters' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  message?: string;

  @IsNotEmpty()
  @IsMongoId()
  feedCommentId: mongoose.Schema.Types.ObjectId;
}
