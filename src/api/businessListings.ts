import axios from 'axios';
import { apiUrl } from '../env';
import { getSessionToken } from '../utils/session-utils';
import { BusinessListing, BusinessType, Cast } from '../routes/business-listings/type';

function processTrailerLinks(trailerLinks: any | null): string | null {
  if (trailerLinks === null) {
    return null;
  }

  const allValuesAreNull = Object.values(trailerLinks).every((value) => value === null);

  if (allValuesAreNull) {
    return null;
  }

  return JSON.stringify(trailerLinks);
}

function processCasts(casts: Cast[] | null): string | null {
  if (casts === null || casts.length === 0) {
    return null;
  }

  const filteredCasts = casts.filter((cast: Cast) => cast.castImage !== null
    && cast.name.trim() !== ''
    && cast.characterName.trim() !== '');

  const processedCasts = filteredCasts.map((cast: Cast) => ({
    ...cast,
    castImage: typeof cast.castImage === 'string' ? cast.castImage : undefined,
  }));

  return processedCasts.length > 0 ? JSON.stringify(processedCasts) : null;
}

export async function createListing(listing: BusinessListing) {
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
    formData.append('trailerLinks', processTrailerLinks(listing.trailerLinks) ?? '');
    formData.append('casts', processCasts(listing.casts as Cast[]) ?? '');
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
