import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card } from 'react-bootstrap';
import styled from 'styled-components';

interface Props {
  listDetail: PosterCardProps
}

interface PosterCardProps {
  id: number;
  image: string;
  place: string;
  type: string;
  rating: string;
  description: string;
  location: string;
  distance: string;
  date: string;
}

const EventsCardStyle = styled(Card)`
  img {
    aspect-ratio: 1.78;
  }
  margin-bottom: 0.75rem;
  margin-top: 0.75rem;
  .rating {    
    width: 3.6rem;
    height: 1.6rem;
    padding: 0.15rem 0.5rem;
    .fa-star {
      color: #FF8A00;
      width: 0.904rem;
      height: 0.862rem;
    }
  }
`;
function PlacePosterCard({ listDetail }: Props) {
  return (
    <EventsCardStyle className="rounded-3 bg-dark px-3 py-4">
      <Card.Img variant="top" src={listDetail.image} className="rounded-4 mb-2" />
      <Card.Body className="p-0">
        <div className="d-flex justify-content-between align-items-center">
          <p className="fs-4 m-0 mt-2 text-light">
            {listDetail.date}
          </p>
          <div className="rating bg-white mb-0 rounded-5 fs-5 text-black">
            <FontAwesomeIcon icon={solid('star')} className="me-1 my-auto" />
            <span className="h5">3.0</span>
          </div>
        </div>
        <h2 className="mt-3 fw-bold">{listDetail.place}</h2>
        <p className="fs-4 text-primary mb-1">{listDetail.type}</p>
        <p className="fs-4 text-light">{listDetail.description}</p>
        <FontAwesomeIcon icon={solid('location-dot')} className="text-primary me-2" size="sm" />
        {listDetail.location}
        <div className="mt-4">
          <span className="text-primary fs-4">Distance From You: </span>
          <span>{listDetail.distance}</span>
        </div>
      </Card.Body>
    </EventsCardStyle>
  );
}

export default PlacePosterCard;
