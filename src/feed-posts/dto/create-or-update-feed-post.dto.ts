import {
  IsOptional, MaxLength,
} from 'class-validator';

export class CreateOrUpdateFeedPostsDto {
  @IsOptional()
  @MaxLength(1000, { message: 'message cannot be longer than 1000 characters' })
  message?: string;
}
