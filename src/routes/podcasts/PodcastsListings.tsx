import { Container, Row } from 'react-bootstrap';
import { BusinessListing } from '../business-listings/type';
import ListingCard from '../../components/ui/BusinessListing/ListingCard';

interface BasicPodcastsIndexProps {
  listings: BusinessListing[];
}

function PodcastsListings({ listings }: BasicPodcastsIndexProps) {
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

export default PodcastsListings;
