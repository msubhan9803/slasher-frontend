import {
  IsEnum,
  IsString,
} from 'class-validator';
import { FileType } from 'src/schemas/businessListing/businessListing.enums';

export class UpdateBusinessListingImageCoverDto {
  @IsEnum(FileType, { message: 'Invalid business type' })
  type: FileType;

  @IsString()
  listingId: string;

  @IsString()
  listingType: string;
}
