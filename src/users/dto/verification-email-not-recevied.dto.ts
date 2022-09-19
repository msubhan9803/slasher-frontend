import { IsEmail, IsNotEmpty } from 'class-validator';

export class VerificationEmailNotReceivedDto {
  @IsNotEmpty()
  @IsEmail(
    {},
    {
      message: 'Not a valid-format email address.',
    },
  )
  email: string;
}
