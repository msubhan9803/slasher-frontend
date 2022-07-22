import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card } from 'react-bootstrap';
import styled from 'styled-components';
import { SearchProps } from '../SearchInterface';

const EventsCardStyle = styled(Card)`
  img {
    aspect-ratio: 16/9;
  }
  margin-bottom: 0.75rem;
  margin-top: 0.75rem;
`;

function Events({
  name, image, date, address,
}: SearchProps) {
  return (
    <EventsCardStyle className="bg-dark px-3 py-4">
      <Card.Img variant="top" src={image} className="rounded-3 mb-2" />
      <Card.Body className="p-0">
        <Card.Text className="text-light m-0">
          {date}
        </Card.Text>
        <Card.Text className="text-light my-2">
          <FontAwesomeIcon icon={solid('location-dot')} className="text-primary me-2" size="sm" />
          {address}
        </Card.Text>
        <Card.Text className="m-0 fw-bold">
          {name}
        </Card.Text>
      </Card.Body>
    </EventsCardStyle>
  );
}

export default Events;
