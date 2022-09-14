import { IsNotEmpty, IsEmail } from 'class-validator';

export class CheckEmailQueryDto {
  @IsNotEmpty()
  @IsEmail(
    {},
    {
      message: 'Not a valid-format email address.',
    },
  )
  email: string;
}
