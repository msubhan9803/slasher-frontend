import { IsNotEmpty, Matches } from 'class-validator';
import { SIMPLE_MONGODB_ID_REGEX } from '../../constants';

export class CreateBlockDto {
  @IsNotEmpty()
  @Matches(SIMPLE_MONGODB_ID_REGEX)
  userId: string;
}
