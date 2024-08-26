import styled from 'styled-components';
import { Container, Row } from 'react-bootstrap';
import {
  BusinessListing,
  BusinessType,
} from '../../../routes/business-listings/type';
import CreateBusinessListingButton from '../../layout/right-sidebar-wrapper/components/CreateBusinessListingButton';
import ListingCard from '../BusinessListing/ListingCard';

type Props = {
  listings: BusinessListing[];
};

const StyledWrapper = styled.div`
  max-width: 240px !important;
`;

export default function VendorListings({ listings }: Props) {
  return (
    <div className="bg-dark bg-mobile-transparent rounded-3 px-lg-4 pt-lg-4 pb-lg-2 mt-4">
      <div className="d-flex justify-content-between align-items-center">
        <h1 className="fs-1 m-0">Vendors</h1>

        <StyledWrapper>
          <CreateBusinessListingButton type={BusinessType.VENDOR} />
        </StyledWrapper>
      </div>

      <div className="m-md-2">
        <Container fluid>
          <Row className="g-3">
            {listings && listings.length > 0 ? (
              listings.map((listing) => (
                <ListingCard
                  key={listing._id}
                  listingId={listing._id as string}
                  title={listing.title as string}
                  businessLogo={listing.businessLogo as string}
                  overview={listing.overview as string}
                  editUrl={`/app/business-listings/create?id=${listing._id}&type=${BusinessType.VENDOR}`}
                />
              ))
            ) : (
              <p className="text-light fw-bold text-center">No Data</p>
            )}
          </Row>
        </Container>
      </div>
    </div>
  );
}
