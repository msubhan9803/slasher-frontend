import { Container, Row } from 'react-bootstrap';
import { BusinessListing } from '../business-listings/type';
import ListingCard from '../../components/ui/BusinessListing/ListingCard';

interface BasicArtIndexProps {
  listings: BusinessListing[];
}

function ArtListings({ listings }: BasicArtIndexProps) {
  return (
    <Container fluid>
      <Row className="g-3">
        {listings.map((listing: BusinessListing) => (
          <ListingCard
            key={listing._id}
            listingId={listing._id as string}
            title={listing.title as string}
            businessLogo={listing.businessLogo as string}
            overview={listing.overview as string}
          />
        ))}
      </Row>
    </Container>
  );
}

export default ArtListings;
