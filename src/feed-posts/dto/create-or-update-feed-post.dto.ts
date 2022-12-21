import {
  IsOptional, MaxLength,
} from 'class-validator';

export class CreateOrUpdateFeedPostsDto {
  @IsOptional()
  @MaxLength(20000, { message: 'message cannot be longer than 20,000 characters' })
  message?: string;
}
