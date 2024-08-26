import { Factory } from 'fishery';
import { BusinessType } from '../../src/schemas/businessListing/businessListing.enums';
import { BusinessListing } from '../../src/schemas/businessListing/businessListing.schema';
import { addFactoryToRewindList } from '../helpers/factory-helpers.ts';

export const businessListingFactory = Factory.define<Partial<BusinessListing>>(() => new BusinessListing({
  businesstype: BusinessType.ARTIST,
  businessLogo: 'http://localhost:4000/api/v1/local-storage/business-listing/business-listing_6b44257a-ae1f-4d2b-8e13-8d4e2e7b86a8.jpeg',
  coverPhoto: '/business-listing/business-listing_bca83ffa-2534-47fa-9f96-650a9b820b39.png',
  title: 'Horror NFT',
  overview: 'Horror NFT | Buy Now | Visit Website',
  isActive: true,
  bookRef: null,
  movieRef: null,
  email: 'mohammadsubhan9803@gmail.com',
  phoneNumber: '+923117085235',
  address: '',
  websiteLink: 'www.example.com',
}));

addFactoryToRewindList(businessListingFactory);
