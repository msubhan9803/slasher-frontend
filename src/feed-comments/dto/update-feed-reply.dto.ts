import { IsNotEmpty, MaxLength } from 'class-validator';

export class UpdateFeedReplyDto {
  @IsNotEmpty()
  @MaxLength(1000, { message: 'message cannot be longer than 1000 characters' })
  message?: string;
}
