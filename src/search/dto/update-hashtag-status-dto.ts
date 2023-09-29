import {
  IsInt, IsNotEmpty, IsNumber, Max, Min,
} from 'class-validator';
import { HashtagActiveStatus } from '../../schemas/hastag/hashtag.enums';

export class UpdateHashtagStatusDto {
  @IsNotEmpty()
  @IsNumber()
  @IsInt()
  @Max(2, { message: 'status can be 0, 1 or 2' })
  @Min(0, { message: 'status can be 0, 1 or 2' })
  status: HashtagActiveStatus;
}
