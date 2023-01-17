import { IsNotEmpty, IsMongoId } from 'class-validator';

export class MarkConversationReadDto {
  @IsNotEmpty()
  @IsMongoId()
  matchListId: string;
}
