import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card } from 'react-bootstrap';
import styled from 'styled-components';
import { SearchProps } from '../SearchInterface';
import EventPost from '../../../images/event-post.svg';

const EventsCardStyle = styled(Card)`
  img {
    aspect-ratio: 1.78;
  }
  margin-bottom: 0.75rem;
  margin-top: 0.75rem;
`;

function Events({
  name, date, address,
}: SearchProps) {
  return (
    <EventsCardStyle className="bg-dark px-3 py-4">
      <Card.Img variant="top" src={EventPost} className="rounded-3 mb-2" />
      <Card.Body className="p-0">
        <Card.Text className="small m-0 mt-2">
          {date}
        </Card.Text>
        <Card.Text className=" my-2">
          <FontAwesomeIcon icon={solid('location-dot')} className="text-primary me-2" size="sm" />
          {address}
        </Card.Text>
        <h1 className="m-0 h2">
          {name}
        </h1>
      </Card.Body>
    </EventsCardStyle>
  );
}

export default Events;
