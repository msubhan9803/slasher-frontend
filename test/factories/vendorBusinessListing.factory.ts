import { Factory } from 'fishery';
import { BusinessType, ListingType } from '../../src/schemas/businessListing/businessListing.enums';
import { BusinessListing } from '../../src/schemas/businessListing/businessListing.schema';
import { addFactoryToRewindList } from '../helpers/factory-helpers.ts';

const randomName = Math.random().toString(36).substring(2, 5);

export const vendorBusinessListingFactory = Factory.define<Partial<BusinessListing>>(({ sequence }) => new BusinessListing({
  businesstype: BusinessType.VENDOR,
  listingType: ListingType.LISTING1,
  businessLogo: 'http://localhost:4000/api/v1/local-storage/business-listing/business-listing_6b44257a-ae1f-4d2b-8e13-8d4e2e7b86a8.jpeg',
  coverPhoto: '/business-listing/business-listing_bca83ffa-2534-47fa-9f96-650a9b820b39.png',
  title: `Vendor?! ${randomName}${sequence}`,
  overview: 'Horror Vendor | Buy Now | Visit Website',
  isActive: true,
  bookRef: null,
  movieRef: null,
  email: 'mohammadsubhan9803@gmail.com',
  phoneNumber: '+923117085235',
  address: '',
  websiteLink: 'www.example.com',
}));

addFactoryToRewindList(vendorBusinessListingFactory);
