import {
  IsMongoId, IsNotEmpty, IsOptional,
} from 'class-validator';

export class MatchListIdDto {
  @IsNotEmpty()
  @IsMongoId()
  matchListId: string;

  @IsOptional()
  message?: string;
}
