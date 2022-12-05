import { IsNotEmpty, IsMongoId } from 'class-validator';

export class GetConversationQueryDto {
  @IsNotEmpty()
  @IsMongoId()
  matchListId: string;
}
