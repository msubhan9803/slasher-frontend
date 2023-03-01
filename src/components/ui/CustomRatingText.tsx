import React from 'react';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';
import { formatNumberForRating } from '../../utils/number.utils';

interface RatingTextProps {
  rating: number;
  icon: IconDefinition;
  ratingType: string;
  customWidth: string;
  customHeight: string;
  ratingCount?: string;
}

interface RatingIConProps {
  ratingtype: string;
  width: string;
  height: string;
}
const StyledRatingIcon = styled(FontAwesomeIcon) <RatingIConProps>`
  ${(props) => (props.ratingtype === 'star' ? `
    color: #FF8A00;
    width: ${props.width};
    height: ${props.height}
  ` : '')}
  ${(props) => (props.ratingtype === 'burst' ? `
    color: #FF1800;
    width: ${props.width};
    height: ${props.height}
  ` : '')}
`;

function CustomRatingText({
  rating, icon, ratingType, customWidth, customHeight, ratingCount,
}: RatingTextProps) {
  return (
    <>
      <StyledRatingIcon width={customWidth} height={customHeight} ratingtype={ratingType} icon={icon} size="xs" />
      <div className="d-flex align-items-center m-md-0 ">
        <p className="fw-bold m-0 mx-2">
          {formatNumberForRating(rating)}
          /
          <span className="fw-normal">
            5
          </span>
        </p>
        {ratingCount && <p className="m-0 text-light">{ratingCount}</p>}
      </div>
    </>

  );
}

CustomRatingText.defaultProps = {
  ratingCount: '',
};

export default CustomRatingText;
