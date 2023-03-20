import React, { useState } from 'react';
import {
  Button, Image, Modal,
} from 'react-bootstrap';
import styled from 'styled-components';
import CustomModal from './CustomModal';

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

const FullscreenImage = styled(Image)`
  display: block;
  max-width: 100%;
  max-height: 100%;
  height: auto;
  margin: auto;
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
      <CustomModal show={showZoomModal} fullscreen onHide={() => setShowZoomModal(false)}>
        <Modal.Header closeButton />
        <Modal.Body>
          <div className="w-100 h-100 d-flex align-items-center">
            <FullscreenImage alt={alt} src={src} className="" />
          </div>
        </Modal.Body>
      </CustomModal>
    </div>
  );
}

export default ZoomableImageThumbnail;
