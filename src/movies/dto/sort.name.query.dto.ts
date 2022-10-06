import { Matches } from 'class-validator';

export class SortNameQueryDto {
  @Matches(/^[a-z0-9#]$/)
  startsWith: string;
}
