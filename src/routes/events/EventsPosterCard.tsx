import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card } from 'react-bootstrap';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

interface Props {
  listDetail: EventCardProps
}

interface EventCardProps {
  id: number | string;
  image: string;
  location: string;
  eventName: string;
  date: string;
  city: string;
  state: string;
  country: string;
}

const EventsCardStyle = styled(Card)`
  background: #1F1F1F;
  img {
    aspect-ratio: 1.78;
    object-fit: contain;
  }
  margin-bottom: 0.75rem;
  margin-top: 0.75rem;
`;

function EventsPosterCard({ listDetail }: Props) {
  return (
    <Link to={`/app/events/${listDetail.id}`} className="text-decoration-none">
      <EventsCardStyle className="rounded-3 px-3 pt-4 pb-2">
        <Card.Img variant="top" src={listDetail.image} alt="event poster" className="mb-2 bg-black" />
        <Card.Body className="p-0 mt-2">
          <div className="d-flex justify-content-between align-items-center">
            <p className="fs-5 m-0 mt-2 text-light">
              {listDetail.date}
            </p>
          </div>
          {listDetail.eventName && <h2 className="my-1">{listDetail.eventName}</h2>}
          <div className="fs-3">
            <FontAwesomeIcon icon={solid('location-dot')} className="text-primary me-2" size="sm" />
            {listDetail?.city}
            ,
            {' '}
            {listDetail?.state}
            ,
            {' '}
            {listDetail?.country}
          </div>
        </Card.Body>
      </EventsCardStyle>
    </Link>
  );
}

export default EventsPosterCard;
