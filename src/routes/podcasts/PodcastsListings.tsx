import { Link } from 'react-router-dom';
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
  color: #e0e0e0; /* lighter white tone */
`;

const CardTitle = styled(Card.Title)`
  font-weight: bold;
  color: #ffffff; /* white color */
`;

const CardLink = styled(Link)`
  text-decoration: none !important;
  color: inherit;
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
            <CardLink to={`/app/business-listings/detail/${listing._id}`}>
              <StyledCard bg="transparent">
                <StyledCardImg variant="top" src={listing.businessLogo} />

                <Card.Body className="px-0 py-10">
                  <CardTitle>{listing.title}</CardTitle>
                  <StyledCardText>{listing.overview}</StyledCardText>
                </Card.Body>
              </StyledCard>
            </CardLink>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default PodcastsListings;
