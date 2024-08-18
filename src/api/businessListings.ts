/* eslint-disable max-len */
/* eslint-disable max-lines */
import axios from 'axios';
import { apiUrl } from '../env';
import { getSessionToken } from '../utils/session-utils';
import {
  BusinessListing, BusinessType, Cast, FileType, ListingType, TrailerLinks,
} from '../routes/business-listings/type';
import { generateParamsString } from '../utils/params-string-generator-utils';

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
  } else {
    formData.append('email', listing.email ?? '');
    formData.append('phoneNumber', listing.phoneNumber ?? '');
    formData.append('address', listing.address ?? '');
    formData.append('websiteLink', listing.websiteLink ?? '');
  }

  // Listing Image / Movie / Book Images
  if (listing.image) {
    formData.append('files', listing.image as File);
  }

  // Applicable for listings other than books / movies
  if (listing.coverPhoto) {
    formData.append('files', listing.coverPhoto as File);
  }

  // Note: Only added if type is movie and first image is movie cover photo
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

export async function updateListing(listing: BusinessListing) {
  const token = await getSessionToken();
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // Create payload based on business type
  const payload: any = {
    _id: listing._id,
    title: listing.title,
    overview: listing.overview,
    link: listing.link,
  };

  if (listing.businesstype === BusinessType.BOOKS) {
    payload.businesstype = BusinessType.BOOKS;
    payload.yearReleased = parseInt((listing.yearReleased as number).toString(), 10);
    payload.bookRef = listing.bookRef?._id;
    payload.author = listing.author;
    payload.pages = parseInt((listing.pages as number)?.toString(), 10);
    payload.isbn = listing.isbn;
  } else if (listing.businesstype === BusinessType.MOVIES) {
    payload.businesstype = BusinessType.MOVIES;
    payload.movieRef = listing.movieRef?._id;
    payload.yearReleased = parseInt((listing.yearReleased as number).toString(), 10);
    payload.countryOfOrigin = listing.countryOfOrigin;
    payload.durationInMinutes = parseInt((listing.durationInMinutes as number)?.toString(), 10);
    payload.officialRatingReceived = parseInt(listing.officialRatingReceived as string, 10);
    payload.trailerLinks = Object.values(listing.trailerLinks as TrailerLinks);
  } else {
    payload.email = listing.email;
    payload.phoneNumber = listing.phoneNumber;
    payload.address = listing.address;
    payload.websiteLink = listing.websiteLink;
  }

  return axios.put(
    `${apiUrl}/api/v1/business-listing/update-listing`,
    payload,
    { headers },
  );
}

export async function updateListingThumbnailOrCoverPhoto(type: FileType, listingId: string, file: File, listingType: ListingType) {
  const token = await getSessionToken();
  const headers = {
    'Content-Type': 'multipart/form-data',
    Authorization: `Bearer ${token}`,
  };

  const formData = new FormData();
  formData.append('type', type);
  formData.append('listingId', listingId);
  formData.append('listingType', listingType);
  formData.append('files', file);

  return axios.post(
    `${apiUrl}/api/v1/business-listing/update-listing-thumbnail-or-cover-photo`,
    formData,
    { headers },
  );
}

export async function toggleListingStatus(listingId: string, businessType: string) {
  const token = await getSessionToken();
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  return axios.put(
    `${apiUrl}/api/v1/business-listing/toggle-listing-status`,
    { listingId, businessType },
    { headers },
  );
}

export async function fetchListingTypes() {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  return axios.get(
    `${apiUrl}/api/v1/business-listing/get-all-listing-types`,
    { headers },
  );
}

export async function fetchListings(paramObj: {
  businesstype?: string | null;
}) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const paramString = generateParamsString(paramObj) ?? '';

  return axios.get(
    `${apiUrl}/api/v1/business-listing/get-all-listings?${paramString}`,
    { headers },
  );
}

export async function fetchListingsAdmin(paramObj: {
  businesstype?: string | null;
}) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const paramString = generateParamsString(paramObj) ?? '';

  return axios.get(
    `${apiUrl}/api/v1/business-listing/get-all-listings-admin?${paramString}`,
    { headers },
  );
}

export async function fetchMyListings(paramObj: {
  userRef?: string;
}) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const paramString = generateParamsString(paramObj) ?? '';

  return axios.get(
    `${apiUrl}/api/v1/business-listing/get-all-my-listings?${paramString}`,
    { headers },
  );
}

export async function fetchListingDetail(listingId: string) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  return axios.get(
    `${apiUrl}/api/v1/business-listing/get-listing-detail/${listingId}`,
    { headers },
  );
}
