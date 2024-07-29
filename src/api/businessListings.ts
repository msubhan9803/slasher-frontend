import axios from 'axios';
import { apiUrl } from '../env';
import { getSessionToken } from '../utils/session-utils';
import { BusinessListing, BusinessType, Cast } from '../routes/business-listings/type';

export async function createListing(listing: BusinessListing) {
  // eslint-disable-next-line no-debugger
  debugger;
  const token = await getSessionToken();
  const headers = {
    'Content-Type': 'multipart/form-data',
    Authorization: `Bearer ${token}`,
  };

  const formData = new FormData();

  // Append common non-file fields
  formData.append('businesstype', listing.businesstype ?? '');
  formData.append('listingType', listing.listingType ?? '');
  formData.append('title', listing.title ?? '');
  formData.append('overview', listing.overview ?? '');
  formData.append('link', listing.link ?? '');
  formData.append('yearReleased', listing.yearReleased?.toString() ?? '');

  // Conditionally append fields based on business type
  if (listing.businesstype === BusinessType.BOOKS) {
    formData.append('author', listing.author ?? '');
    formData.append('pages', listing.pages?.toString() ?? '');
    formData.append('isbn', listing.isbn ?? '');
  } else if (listing.businesstype === BusinessType.MOVIES) {
    formData.append('countryOfOrigin', listing.countryOfOrigin ?? '');
    formData.append('durationInMinutes', listing.durationInMinutes?.toString() ?? '');
    formData.append('officialRatingReceived', listing.officialRatingReceived ?? '');

    // Stringify and append movie-specific complex fields
    formData.append('trailerLinks', JSON.stringify(listing.trailerLinks ?? {}));
    formData.append(
      'casts',
      JSON.stringify(
        listing.casts?.map((cast: Cast) => ({
          ...cast,
          castImage: typeof cast.castImage === 'string' ? cast.castImage : undefined,
        })) ?? [],
      ),
    );
  }

  // Handle file uploads
  if (listing.image) {
    formData.append('files', listing.image as File);
  }

  if (listing.businesstype === BusinessType.MOVIES && listing.casts) {
    listing.casts.forEach((cast: Cast) => {
      if (cast.castImage && !(typeof cast.castImage === 'string')) {
        formData.append('files', cast.castImage);
      }
    });
  }

  return axios.post(
    `${apiUrl}/api/v1/business-listing/create-listing`,
    formData,
    { headers },
  );
}
