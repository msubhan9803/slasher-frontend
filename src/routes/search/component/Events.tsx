import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card } from 'react-bootstrap';
import styled from 'styled-components';
import { SearchProps } from '../SearchInterface';

const MovieCardStyle = styled(Card)`
  img {
    height: 10.938rem;
  }

  .card-img-overlay {
    top: 7.813rem;

    .rating {
      height: 1.563rem;
      line-height: 2
    }
  }
  .fa-star {
    color: #FF8A00;
  }
  .fa-thumbs-down {
    transform: rotateY(180deg);
  }
`;

function Events({
  name, image, date, address,
}: SearchProps) {
  return (
    <MovieCardStyle className="bg-transparent">
      <Card.Img variant="top" src={image} className="rounded-3 mb-2" />
      <Card.Body className="p-0">
        <Card.Text>
          {date}
        </Card.Text>
        <Card.Text>
          <FontAwesomeIcon icon={solid('location-dot')} className="text-primary me-2" size="sm" />
          {address}
        </Card.Text>
        <Card.Text>
          {name}
        </Card.Text>
      </Card.Body>
    </MovieCardStyle>
  );
}

export default Events;
