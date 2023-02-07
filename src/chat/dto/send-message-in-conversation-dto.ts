import {
  IsOptional,
} from 'class-validator';

export class SendMessageInConversationDto {
  @IsOptional()
  message?: string;
}
