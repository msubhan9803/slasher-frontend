import { Factory } from 'fishery';
import { CreateBusinessListingDto } from 'src/business-listing/dto/create-business-listing.dto';
import { BusinessType, ListingType } from '../../src/schemas/businessListing/businessListing.enums';
import { addFactoryToRewindList } from '../helpers/factory-helpers.ts';

const randomName = Math.random().toString(36).substring(2, 5);

export const bookBusinessListingFactory = Factory.define<Partial<CreateBusinessListingDto>>(({ sequence }) => (
  {
    businesstype: BusinessType.BOOKS,
    listingType: ListingType.LISTING1,
    title: `Book?! ${randomName}${sequence}`,
    overview: 'Best Book',
    isActive: true,
    bookRef: null,
    movieRef: null,
    link: 'https://www.amazon.com/Whispering-Shadows-Novel-Rising-Dragon/dp/1476793654',
    yearReleased: 2011,
    author: 'Erin Morgenstern',
    pages: 352,
    isbn: '0385534639',
    officialRatingReceived: '4',
  }
));

addFactoryToRewindList(bookBusinessListingFactory);
