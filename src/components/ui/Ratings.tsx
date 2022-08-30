import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import styled from 'styled-components';
import RoundButton from './RoundButton';

interface RatingProps {
  changeRating?: (value: boolean) => void;
}

const StyleBorderButton = styled(RoundButton)`
  border: 0.063rem solid #3A3B46;
  &:hover {
    border: 0.063rem solid #3A3B46;
  }
`;
function Ratings({ changeRating }: RatingProps) {
  return (
    <div className="rating align-items-center d-flex py-3 pb-xxl-0 justify-content-center justify-content-xl-start">
      <span className="fs-3 me-3 me-xxl-2 align-items-center d-flex justify-content-end justify-content-xl-start">
        <FontAwesomeIcon icon={solid('star')} size="xs" className="star mb-2 mt-1" />
        <div className="d-flex">
          <p className="fw-bold m-0 mx-2">3.3/5</p>
          <p className="m-0 text-light me-xxl-2">(10K)</p>
        </div>
      </span>
      <StyleBorderButton onClick={changeRating} className="d-flex align-items-center rate-btn bg-black py-2" variant="lg">
        <FontAwesomeIcon icon={regular('star')} size="sm" className="mb-1 me-2" />
        <p className="fs-3 fw-bold m-0">Rate</p>
      </StyleBorderButton>
    </div>
  );
}

Ratings.defaultProps = {
  changeRating: (value: boolean) => value,
};

export default Ratings;
