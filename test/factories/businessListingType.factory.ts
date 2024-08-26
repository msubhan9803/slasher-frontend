import { Factory } from 'fishery';
import { addFactoryToRewindList } from '../helpers/factory-helpers.ts';
import { BusinessListingType } from '../../src/schemas/businessListingType/businessListingType.schema';
import { ListingName } from '../../src/schemas/businessListingType/businessListingType.enums';

export const businessListingTypeFactory = Factory.define<Partial<BusinessListingType>>(() => new BusinessListingType({
  name: ListingName.LISTING1,
  label: 'Listing 1',
  features: [
      'Listing in our movies database',
      'Appear in Suggested section',
      'Appear in our newsletter',
  ],
  price: 30,
}));

addFactoryToRewindList(businessListingTypeFactory);
