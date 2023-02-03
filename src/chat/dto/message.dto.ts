import {
  IsOptional,
} from 'class-validator';

export class MessageDto {
  @IsOptional()
  message?: string;
}
