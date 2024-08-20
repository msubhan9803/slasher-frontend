import { IsMongoId } from 'class-validator';

export class ParamBusinessListingIdDto {
  @IsMongoId()
  businessListingRef: string;
}
