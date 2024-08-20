import useMyListings from '../../../hooks/businessListing/useMyListings';
import BookListings from './BookListings';
import LoadingIndicator from '../LoadingIndicator';
import { BusinessListing } from '../../../routes/business-listings/type';
import MovieListings from './MovieListings';
import PodcastListings from './PodcastListings';
import MusicsListings from './MusicsListings';
import ArtistListings from '../../../routes/artists/ArtistListings';

export default function MainListingWrapper() {
  const { listings, loadingListings } = useMyListings();

  if (loadingListings) {
    return <LoadingIndicator />;
  }

  return (
    <div>
      <ArtistListings listings={listings?.artist as BusinessListing[]} />
      <BookListings listings={listings?.books as BusinessListing[]} />
      <MovieListings listings={listings?.movies as BusinessListing[]} />
      <MusicsListings listings={listings?.musician as BusinessListing[]} />
      <PodcastListings listings={listings?.podcaster as BusinessListing[]} />
    </div>
  );
}
