import {
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsString, MaxLength,
} from 'class-validator';
import { VALID_REPORT_TYPES, ReportType } from '../../types';

export class CreateReportDto {
  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  targetId: string;

  @IsNotEmpty()
  @IsIn(VALID_REPORT_TYPES)
  @IsString()
  reportType: ReportType;

  @IsNotEmpty()
  @IsString()
  @MaxLength(1000, { message: 'Report cannot be longer than 1,000 characters' })
  reason?: string;
}
