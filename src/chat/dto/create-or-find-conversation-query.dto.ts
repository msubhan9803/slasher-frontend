import { IsNotEmpty, IsMongoId } from 'class-validator';

export class CreateOrFindConversationQueryDto {
  @IsNotEmpty()
  @IsMongoId()
  userId: string;
}
