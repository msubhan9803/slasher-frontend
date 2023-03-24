import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsOptional,
} from 'class-validator';

export class SendMessageInConversationDto {
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  message?: string;
}
