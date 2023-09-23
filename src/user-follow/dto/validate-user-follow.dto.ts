import { Transform } from 'class-transformer';
import { IsBoolean, IsMongoId, IsNotEmpty } from 'class-validator';

export class CreateUserFollowDTO {
  @IsNotEmpty()
  @IsMongoId()
  followUserId: string;

  @IsNotEmpty()
  @IsBoolean()
  @Transform(({ value }) => value === true)
  notification: boolean;
}
