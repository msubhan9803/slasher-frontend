import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsMongoId, IsNotEmpty, IsOptional,
} from 'class-validator';

export class SendMessageInConversationParamsDto {
  @IsNotEmpty()
  @IsMongoId()
  matchListId: string;

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  message?: string;
}
