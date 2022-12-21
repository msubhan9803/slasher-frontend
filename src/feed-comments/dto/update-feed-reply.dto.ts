import { IsNotEmpty, MaxLength } from 'class-validator';

export class UpdateFeedReplyDto {
  @IsNotEmpty()
  @MaxLength(8000, { message: 'message cannot be longer than 8,000 characters' })
  message?: string;
}
