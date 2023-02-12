import {
  IsMongoId, IsNotEmpty, IsOptional,
} from 'class-validator';

export class SendMessageInConversationParamsDto {
  @IsNotEmpty()
  @IsMongoId()
  matchListId: string;

  @IsOptional()
  message?: string;
}
