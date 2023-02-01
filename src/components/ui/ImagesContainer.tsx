import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Image } from 'react-bootstrap';
import styled from 'styled-components';
import { string } from 'prop-types';

interface ImageContainerProps {
  image: any;
  alt: string;
  handleRemoveImage: (image: File, id?: string) => void;
  containerClass: string;
  removeIconStyle: any;
  containerWidth: string;
  containerHeight: string;
  containerBorder: string;
  dataId?: string;
}
interface StyledImageContainerProps {
  width: string;
  height: string;
  border: string;
}
const StyledImageContainer = styled.div<StyledImageContainerProps>`
  width: ${(props) => props.width};
  height: ${(props) => props.height};
  border: ${(props) => props.border};
`;

function ImagesContainer({
  image, alt, handleRemoveImage, containerClass, removeIconStyle,
  containerWidth, containerHeight, containerBorder, dataId,
}: ImageContainerProps) {
  return (
    <StyledImageContainer
      width={containerWidth}
      height={containerHeight}
      border={containerBorder}
      className={containerClass}
    >
      <Image
        src={URL.createObjectURL(image)}
        alt={alt}
        className="w-100 h-100 img-fluid rounded"
      />
      <FontAwesomeIcon
        icon={solid('times')}
        size="xs"
        role="button"
        className="position-absolute bg-white text-primary rounded-circle"
        style={removeIconStyle}
        onClick={() => (dataId ? handleRemoveImage(image, dataId) : handleRemoveImage(image))}
      />
    </StyledImageContainer>
  );
}

ImagesContainer.defaultProps = {
  dataId: undefined,
};

export default ImagesContainer;
