import { IsNotEmpty, Length, Matches } from 'class-validator';

export class CheckUserNameQueryDto {
  @IsNotEmpty()
  @Length(3, 30)
  @Matches(/^[a-zA-Z0-9]([a-zA-Z0-9_.-]+)[a-zA-Z0-9]$/, {
    message:
      'Cannot start and end with any special character, Can only include letters, numbers, and the following special characters: [".", "-", "_"].',
  })
  userName: string;
}
