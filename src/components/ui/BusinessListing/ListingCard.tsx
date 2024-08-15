import React from 'react';
import { Link } from 'react-router-dom';
import { Col } from 'react-bootstrap';
import Card from 'react-bootstrap/Card';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';

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

const EditIcon = styled(Link)`
  position: absolute;
  top: 10px;
  right: 10px;
  color: #fff;
  font-size: 1.5rem;
  z-index: 99;
`;

interface ListingCardProps {
  listingId: string;
  businessLogo: string;
  title: string;
  overview: string;
  editUrl?: string;
}

function ListingCard({
  listingId,
  businessLogo,
  title,
  overview,
  editUrl,
}: ListingCardProps) {
  return (
    <Col xs={6} lg={4} key={listingId}>
      <CardLink to={`/app/business-listings/detail/${listingId}`}>
        <StyledCard bg="transparent">
          <ImageWrapper>
            {editUrl && (
              <EditIcon to={editUrl}>
                <FontAwesomeIcon icon={solid('pencil-alt')} />
              </EditIcon>
            )}
            <StyledCardImg variant="top" src={businessLogo} />
          </ImageWrapper>
          <Card.Body className="px-0 py-10">
            <CardTitle>{title}</CardTitle>
            <StyledCardText>{overview}</StyledCardText>
          </Card.Body>
        </StyledCard>
      </CardLink>
    </Col>
  );
}

ListingCard.defaultProps = {
  editUrl: '',
};

export default ListingCard;
