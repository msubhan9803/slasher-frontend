import styled from 'styled-components';
import { BusinessListing, BusinessType } from '../../../routes/business-listings/type';
import CreateBusinessListingButton from '../../layout/right-sidebar-wrapper/components/CreateBusinessListingButton';
import PosterCardList from '../Poster/PosterCardList';

type Props = {
  listings: BusinessListing[];
};

const StyledWrapper = styled.div`
  max-width: 240px !important;
`;

export default function BookListings({ listings }: Props) {
  return (
    <div className="bg-dark bg-mobile-transparent rounded-3 px-lg-4 pt-lg-4 pb-lg-2">
      <div className="d-flex justify-content-between align-items-center">
        <h1 className="fs-1 m-0">My Books</h1>

        <StyledWrapper>
          <CreateBusinessListingButton type={BusinessType.BOOKS} />
        </StyledWrapper>
      </div>

      <div className="m-md-2">
        <PosterCardList
          dataList={
            listings.map((listing) => ({
              _id: listing.bookRef?._id,
              id: listing.bookRef?._id,
              name: listing.bookRef?.name,
              logo: listing.bookRef?.coverImage?.image_path,
              year: listing.bookRef?.publishDate,
              liked: false,
              rating: listing.bookRef?.rating,
              worthReading: listing.bookRef?.worthReading,
            })) as any
          }
          type="book"
          editButton
        />
      </div>
    </div>
  );
}
