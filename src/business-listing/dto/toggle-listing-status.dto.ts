import { IsNotEmpty } from 'class-validator';

export class ToggleListingStatusDto {
  @IsNotEmpty()
  listingId: string;

  @IsNotEmpty()
  businessType: string;
}
