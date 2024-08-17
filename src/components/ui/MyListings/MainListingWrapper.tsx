import { useEffect } from 'react';
import useMyListings from '../../../hooks/businessListing/useMyListings';
import BookListings from './BookListings';
import LoadingIndicator from '../LoadingIndicator';
import { BusinessListing } from '../../../routes/business-listings/type';
import MovieListings from './MovieListings';
import PodcastListings from './PodcastListings';
import MusicsListings from './MusicsListings';

export default function MainListingWrapper() {
  const { listings, loadingListings } = useMyListings();

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
      <MusicsListings listings={listings?.musician as BusinessListing[]} />
      <PodcastListings listings={listings?.podcaster as BusinessListing[]} />
    </div>
  );
}
