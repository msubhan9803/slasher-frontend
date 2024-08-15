import { Link } from 'react-router-dom';
import { Col } from 'react-bootstrap';
import Card from 'react-bootstrap/Card';
import styled from 'styled-components';
import { BusinessListing } from '../../../routes/business-listings/type';

const StyledCard = styled(Card)`
  width: 100%;
  border: none;
`;

const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  padding-top: 100%;
  overflow: hidden;
  border-radius: 5px;
`;

const StyledCardImg = styled(Card.Img)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
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

interface ListingCardProps {
  listing: BusinessListing;
}

function ListingCard({ listing }: ListingCardProps) {
  return (
    <Col xs={6} lg={4} key={listing._id}>
      <CardLink to={`/app/business-listings/detail/${listing._id}`}>
        <StyledCard bg="transparent">
          <ImageWrapper>
            <StyledCardImg variant="top" src={listing.businessLogo} />
          </ImageWrapper>
          <Card.Body className="px-0 py-10">
            <CardTitle>{listing.title}</CardTitle>
            <StyledCardText>{listing.overview}</StyledCardText>
          </Card.Body>
        </StyledCard>
      </CardLink>
    </Col>
  );
}

export default ListingCard;
