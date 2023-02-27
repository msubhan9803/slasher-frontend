import { IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class UpdateFeedCommentsDto {
  @IsNotEmpty()
  @MaxLength(8000, { message: 'message cannot be longer than 8,000 characters' })
  message?: string;

  @IsOptional()
  imagesToDelete?: string[];
}
