import React from 'react';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Form } from 'react-bootstrap';
import styled from 'styled-components';
import { SizeProp } from '@fortawesome/fontawesome-svg-core';

const RatingStar = styled.div`
  .fa-star {
    width: rem;
    height: rem;
  }
  .rate {
    color: var(--bs-orange);
  }
  width: fit-content;
`;
type RatingValue = -1 | 0 | 1 | 2 | 3 | 4;

interface RatingButtonGroupProps {
  rating?: number;
  setRating?: (value: RatingValue) => void;
  label?: string;
  size?: SizeProp;
  isGoreFator?: boolean;
}

function RatingButtonGroups({
  rating, setRating, label, size, isGoreFator,
}: RatingButtonGroupProps) {
  return (
    <Form.Group className="my-3">
      {label && <Form.Label className="fw-bold h3">{label}</Form.Label>}
      <RatingStar className="mt-2 align-items-center bg-black d-flex px-2 rounded-pill star-rating">
        {[...Array(5)].map((star, index) => (
          <Button
            variant="link"
            type="button"
            key={star}
            className="px-2 bg-transparent"
            onClick={() => setRating!(index as RatingValue)}
            aria-label="rating"
          >
            {index <= rating! ? (
              <FontAwesomeIcon icon={isGoreFator ? solid('burst') : solid('star')} size={size} className={isGoreFator ? 'text-primary' : 'rate'} />
            ) : (
              <FontAwesomeIcon icon={isGoreFator ? solid('burst') : regular('star')} size={size} className="text-white" />
            )}
          </Button>
        ))}
      </RatingStar>
    </Form.Group>
  );
}

RatingButtonGroups.defaultProps = {
  rating: 0,
  setRating: undefined,
  label: undefined,
  size: undefined,
  isGoreFator: false,
};

export default RatingButtonGroups;
