import useMyListings from '../../../hooks/businessListing/useMyListings';
import BookListings from './BookListings';
import LoadingIndicator from '../LoadingIndicator';
import { BusinessListing } from '../../../routes/business-listings/type';
import MovieListings from './MovieListings';
import PodcastListings from './PodcastListings';
import MusicsListings from './MusicsListings';
import ArtListings from './ArtListings';
import VendorListings from './VendorListings';
import VideoCreatorListings from './VideoCreatorListings';

export default function MainListingWrapper() {
  const { listings, loadingListings } = useMyListings();

  if (loadingListings) {
    return <LoadingIndicator />;
  }

  return (
    <div>
      <h1 className="fs-1 m-0 my-4 my-md-0">My Listings</h1>

      <ArtListings listings={listings?.artist as BusinessListing[]} />
      <BookListings listings={listings?.books as BusinessListing[]} />
      <MovieListings listings={listings?.movies as BusinessListing[]} />
      <MusicsListings listings={listings?.musician as BusinessListing[]} />
      <PodcastListings listings={listings?.podcaster as BusinessListing[]} />
      <VendorListings listings={listings?.vendor as BusinessListing[] ?? []} />
      <VideoCreatorListings listings={listings?.video_creator as BusinessListing[] ?? []} />
    </div>
  );
}
