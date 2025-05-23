import React from 'react';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import BorderButton from './BorderButton';

interface RatingProps {
  changeRating?: (value: boolean) => void;
}

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
      <BorderButton
        buttonClass="d-flex rate-btn"
        variant="lg"
        icon={regular('star')}
        iconClass="mb-1 me-2"
        iconSize="sm"
        lable="Rate"
        handleClick={changeRating}
      />
    </div>
  );
}

Ratings.defaultProps = {
  changeRating: (value: boolean) => value,
};

export default Ratings;
