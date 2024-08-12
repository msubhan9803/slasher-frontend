import { Col, Container, Row } from 'react-bootstrap';
import Card from 'react-bootstrap/Card';
import styled from 'styled-components';
import { BusinessListing } from '../business-listings/type';

const StyledCard = styled(Card)`
  width: 100%;
  border: none;
`;

const StyledCardImg = styled(Card.Img)`
  object-fit: contain;
  width: 100%;
  height: auto;
`;

const StyledCardText = styled(Card.Text)`
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

interface BasicPodcastsIndexProps {
  listings: BusinessListing[];
}

function PodcastsListings({ listings }: BasicPodcastsIndexProps) {
  return (
    <Container fluid>
      <Row className="g-3">
        {listings.map((listing: BusinessListing) => (
          <Col xs={6} lg={4} key={listing._id}>
            <StyledCard bg="transparent">
              <StyledCardImg variant="top" src={listing.businessLogo} />

              <Card.Body className="px-0 py-10">
                <Card.Title>{listing.title}</Card.Title>
                <StyledCardText>{listing.overview}</StyledCardText>
              </Card.Body>
            </StyledCard>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default PodcastsListings;
