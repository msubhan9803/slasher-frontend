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
          <ListingCard key={listing._id} listing={listing} />
        ))}
      </Row>
    </Container>
  );
}

export default PodcastsListings;
