import React, { useEffect } from 'react';
import useMyListings from '../../../hooks/businessListing/useMyListings';
import BookListings from './BookListings';
import LoadingIndicator from '../LoadingIndicator';
import { BusinessListing } from '../../../routes/business-listings/type';
import MovieListings from './MovieListings';

export default function MainListingWrapper() {
  const { listings, loadingListings, listingError } = useMyListings();

  useEffect(() => {
    console.log('listings: ', listings);
  }, [listings]);

  if (loadingListings) {
    return <LoadingIndicator />;
  }

  return (
    <div>
      <BookListings listings={listings?.books as BusinessListing[]} />
      <MovieListings listings={listings?.movies as BusinessListing[]} />
    </div>
  );
}
