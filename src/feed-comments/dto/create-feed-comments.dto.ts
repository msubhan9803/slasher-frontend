import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsMongoId, IsNotEmpty, IsOptional, MaxLength,
} from 'class-validator';
import mongoose from 'mongoose';

export class CreateFeedCommentsDto {
  @IsOptional()
  @MaxLength(8000, { message: 'message cannot be longer than 8,000 characters' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  message?: string;

  @IsNotEmpty()
  @IsMongoId()
  feedPostId: mongoose.Schema.Types.ObjectId;
}
