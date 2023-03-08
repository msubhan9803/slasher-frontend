import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Image } from 'react-bootstrap';
import styled from 'styled-components';

interface FeaturePhotoProps {
  featureImage: string;
  rating: string;
  showRating?: boolean;
}

const StyledFeaturesPhotos = styled.div`
  aspect-ratio: 1;
`;
const StyledRating = styled.div`
  margin-top: -1.875rem;
  svg {
    color: var(--bs-orange);
    width: 0.847rem;
    height: 0.808rem;
  }
`;
function ShoppingFeaturePoster({ featureImage, rating, showRating }: FeaturePhotoProps) {
  return (
    <StyledFeaturesPhotos className="rounded">
      <Image src={featureImage} alt="Featured vendors" className="w-100 h-100 rounded" />
      <StyledRating className="d-flex justify-content-end me-2">
        <p className={`${showRating && 'd-none d-lg-block'} bg-white mb-0 px-2 rounded-5 fs-5 text-black`}>
          <FontAwesomeIcon icon={solid('star')} className="me-1 my-auto" />
          <span className="h5">{rating}</span>
        </p>
      </StyledRating>
    </StyledFeaturesPhotos>
  );
}

ShoppingFeaturePoster.defaultProps = {
  showRating: false,
};

export default ShoppingFeaturePoster;
