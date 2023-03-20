import React, { useState } from 'react';
import {
  Button, Image,
} from 'react-bootstrap';
import styled from 'styled-components';
import ZoomableImageModal from './ZoomingImageModal';

interface Props {
  src: string;
  alt: string;
  className: string;
}

const size = '5.625rem';

const StyledImage = styled(Image).attrs({ className: 'rounded' })`
  width: size;
  height: size;
  border-radius: 50%;
  object-fit: cover;
`;

function ZoomableImageThumbnail({ src, className, alt }: Props) {
  const [showZoomModal, setShowZoomModal] = useState(false);

  return (
    <div className={className}>
      <Button variant="link" className="cursor-zoom-in p-0" onClick={() => setShowZoomModal(true)}>
        <StyledImage
          alt={alt}
          src={src}
          style={{ width: size, height: size }}
        />
      </Button>
      <ZoomableImageModal
        imgSrc={src}
        imgAlt={alt}
        show={showZoomModal}
        onHide={() => setShowZoomModal(false)}
      />
    </div>
  );
}

export default ZoomableImageThumbnail;
