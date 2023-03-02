import { Transform } from 'class-transformer';
import { IsOptional, MaxLength } from 'class-validator';

export class UpdateFeedReplyDto {
  @IsOptional()
  @MaxLength(8000, { message: 'message cannot be longer than 8,000 characters' })
  message?: string;

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : Array(value)))
  imagesToDelete?: string[];
}
