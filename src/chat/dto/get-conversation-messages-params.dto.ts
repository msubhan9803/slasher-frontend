import {
  IsNotEmpty, IsMongoId,
} from 'class-validator';

export class GetConversationMessagesParamsDto {
  @IsNotEmpty()
  @IsMongoId()
  matchListId: string;
}
