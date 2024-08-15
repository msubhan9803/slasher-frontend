import styled from 'styled-components';
import { BusinessListing, BusinessType } from '../../../routes/business-listings/type';
import CreateBusinessListingButton from '../../layout/right-sidebar-wrapper/components/CreateBusinessListingButton';
import MovieOrBookListingList from '../BusinessListing/MovieOrBookListingList';

type Props = {
  listings: BusinessListing[];
};

const StyledWrapper = styled.div`
  max-width: 240px !important;
`;

export default function MovieListings({ listings }: Props) {
  return (
    <div className="bg-dark bg-mobile-transparent rounded-3 px-lg-4 pt-lg-4 pb-lg-2 mt-4">
      <div className="d-flex justify-content-between align-items-center">
        <h1 className="fs-1 m-0">My Movies</h1>

        <StyledWrapper>
          <CreateBusinessListingButton type={BusinessType.MOVIES} />
        </StyledWrapper>
      </div>

      <div className="m-md-2">
        <MovieOrBookListingList
          dataList={
            listings.map((listing) => ({
              _id: listing.movieRef?._id,
              name: listing.movieRef?.name ?? '',
              logo: listing.movieRef?.movieImage,
              year: listing.movieRef?.releaseDate,
              liked: false,
              rating: listing.movieRef?.rating,
              worthWatching: listing.movieRef?.worthWatching,
              listingId: listing._id,
            })) as any
          }
          type="movie"
          editButton
        />
      </div>
    </div>
  );
}
