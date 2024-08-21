import styled from 'styled-components';
import {
  BusinessListing,
  BusinessType,
} from '../../../routes/business-listings/type';
import CreateBusinessListingButton from '../../layout/right-sidebar-wrapper/components/CreateBusinessListingButton';
import MovieOrBookListingList from '../BusinessListing/MovieOrBookListingList';

type Props = {
  listings: BusinessListing[];
};

const StyledWrapper = styled.div`
  max-width: 240px !important;
`;

export default function BookListings({ listings }: Props) {
  return (
    <div className="bg-dark bg-mobile-transparent rounded-3 px-lg-4 pt-lg-4 pb-lg-2 mt-4">
      <div className="d-flex justify-content-between align-items-center">
        <h1 className="fs-1 m-0">My Books</h1>

        <StyledWrapper>
          <CreateBusinessListingButton type={BusinessType.BOOKS} />
        </StyledWrapper>
      </div>

      <div className="m-md-2">
        {listings && listings.length > 0 ? (
          <MovieOrBookListingList
            dataList={
              listings?.map((listing) => ({
                _id: listing.bookRef?._id,
                id: listing.bookRef?._id,
                name: listing.bookRef?.name,
                logo: listing.bookRef?.coverImage?.image_path,
                year: listing.bookRef?.publishDate,
                liked: false,
                rating: listing.bookRef?.rating,
                worthReading: listing.bookRef?.worthReading,
                listingId: listing._id,
              })) as any
            }
            type="book"
            editButton
          />
        ) : (
          <p className="text-light fw-bold text-center">No Data</p>
        )}
      </div>
    </div>
  );
}
