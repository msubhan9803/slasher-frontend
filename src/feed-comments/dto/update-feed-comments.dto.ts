import { IsNotEmpty, MaxLength } from 'class-validator';

export class UpdateFeedCommentsDto {
  @IsNotEmpty()
  @MaxLength(1000, { message: 'message cannot be longer than 1000 characters' })
  message?: string;
}
