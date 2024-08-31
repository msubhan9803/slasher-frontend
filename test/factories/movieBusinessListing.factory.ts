import { Factory } from 'fishery';
import { CreateBusinessListingDto } from 'src/business-listing/dto/create-business-listing.dto';
import { BusinessType, ListingType } from '../../src/schemas/businessListing/businessListing.enums';
import { addFactoryToRewindList } from '../helpers/factory-helpers.ts';

const randomName = Math.random().toString(36).substring(2, 5);

export const movieBusinessListingFactory = Factory.define<Partial<CreateBusinessListingDto>>(({ sequence }) => (
  {
    businesstype: BusinessType.MOVIES,
    listingType: ListingType.LISTING1,
    title: `Movie?! ${randomName}${sequence}`,
    overview: 'Best Movie',
    isActive: true,
    bookRef: null,
    movieRef: null,
    trailerLinks: JSON.stringify({ main: 'http://maintrailer.com', trailer2: 'http://trailer2.com' }),
    durationInMinutes: 120,
    officialRatingReceived: '5',
    yearReleased: 2010,
    link: 'https://www.imdb.com/title/tt1477076/',
  }
));

addFactoryToRewindList(movieBusinessListingFactory);
